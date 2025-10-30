from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from decimal import Decimal
from typing import Dict, List, Tuple, Set

from django.core.cache import cache
from django.db.models import QuerySet

from .models import Cart, Product
from .subcategory_model import get_product_subcategory


# Cache keys
PRODUCT_SIM_CACHE_KEY = "store:product_similarities:v1"
USER_PRODUCTS_CACHE_KEY_TMPL = "store:user_products:{user_id}:v1"  # deprecated: no longer used


@dataclass
class ProductFeatures:
    product_id: int
    category_id: int
    price: float
    in_stock: int
    featured: int
    best_selling: int
    name_tokens: Set[str]


def _to_float(value: Decimal | float | int) -> float:
    return float(value) if value is not None else 0.0


def extract_product_features(products: QuerySet[Product]) -> Dict[int, ProductFeatures]:
    features: Dict[int, ProductFeatures] = {}
    for p in products.only(
        "id",
        "category_id",
        "price",
        "in_stock",
        "featured",
        "best_selling",
        "name",
    ):
        # lowercase alphanumeric tokenization
        tokens = {t for t in ''.join(ch.lower() if ch.isalnum() else ' ' for ch in p.name).split() if t}
        features[p.id] = ProductFeatures(
            product_id=p.id,
            category_id=p.category_id or 0,
            price=_to_float(p.price),
            in_stock=1 if p.in_stock else 0,
            featured=1 if p.featured else 0,
            best_selling=1 if p.best_selling else 0,
            name_tokens=tokens,
        )
    return features


def _content_similarity(a: ProductFeatures, b: ProductFeatures) -> float:
    # Strictly enforce category relevance
    if a.category_id != b.category_id:
        return 0.0

    # Simple engineered similarity: price proximity + flags overlap + name token overlap
    category_score = 1.0  # already ensured same category

    # Price similarity: inverse of relative difference, clipped [0,1]
    if a.price == 0 or b.price == 0:
        price_score = 0.0
    else:
        rel_diff = abs(a.price - b.price) / max(a.price, b.price)
        price_score = max(0.0, 1.0 - rel_diff)  # closer prices -> higher score

    flags_a = [a.in_stock, a.featured, a.best_selling]
    flags_b = [b.in_stock, b.featured, b.best_selling]
    overlap = sum(1 for x, y in zip(flags_a, flags_b) if x == 1 and y == 1)
    flags_score = overlap / 3.0

    # Name similarity via Jaccard on tokens
    if a.name_tokens or b.name_tokens:
        inter = len(a.name_tokens & b.name_tokens)
        union = len(a.name_tokens | b.name_tokens)
        name_score = (inter / union) if union else 0.0
    else:
        name_score = 0.0

    # Weighted sum: prioritize name, then price, then flags (category fixed)
    return 0.10 * category_score + 0.55 * name_score + 0.30 * price_score + 0.05 * flags_score


def _build_user_baskets() -> Dict[int, List[int]]:
    # user_id -> list of product_ids they have in cart (history)
    user_to_products: Dict[int, List[int]] = defaultdict(list)
    for row in Cart.objects.all().only("user_id", "product_id"):
        user_to_products[row.user_id].append(row.product_id)
    return user_to_products


def _collaborative_cooccurrence(user_baskets: Dict[int, List[int]]) -> Dict[Tuple[int, int], float]:
    # Build simple co-occurrence counts: (prod_a, prod_b) -> count of users who have both
    counts: Dict[Tuple[int, int], int] = defaultdict(int)
    for products in user_baskets.values():
        unique = sorted(set(products))
        for i in range(len(unique)):
            for j in range(i + 1, len(unique)):
                a, b = unique[i], unique[j]
                counts[(a, b)] += 1
                counts[(b, a)] += 1

    # Normalize by max count to get [0,1]
    if not counts:
        return {}
    max_c = max(counts.values())
    return {k: v / max_c for k, v in counts.items()}


def compute_product_similarities(top_k: int = 20) -> Dict[int, List[Tuple[int, float]]]:
    products = Product.objects.filter(in_stock=True)
    feats = extract_product_features(products)

    # Precompute collaborative co-occurrence
    user_baskets = _build_user_baskets()
    cooc = _collaborative_cooccurrence(user_baskets)

    product_ids = list(feats.keys())
    similarities: Dict[int, List[Tuple[int, float]]] = {}

    # Group product ids by category to avoid cross-category similarities
    cat_to_ids: Dict[int, List[int]] = defaultdict(list)
    for pid in product_ids:
        cat_to_ids[feats[pid].category_id].append(pid)

    for pid in product_ids:
        scores: List[Tuple[int, float]] = []
        same_cat_ids = cat_to_ids.get(feats[pid].category_id, [])

        # Further restrict by learned subcategory label
        try:
            subcat_target = get_product_subcategory(pid)
        except Exception:
            subcat_target = -1

        for qid in same_cat_ids:
            if pid == qid:
                continue
            if subcat_target != -1:
                try:
                    if get_product_subcategory(qid) != subcat_target:
                        continue
                except Exception:
                    pass
            content_score = _content_similarity(feats[pid], feats[qid])
            collab_score = cooc.get((pid, qid), 0.0)
            # Hybrid score: mostly content; sprinkle in collaborative
            score = 0.95 * content_score + 0.05 * collab_score
            if score > 0:
                scores.append((qid, score))

        # Keep only top_k
        scores.sort(key=lambda x: x[1], reverse=True)
        similarities[pid] = scores[:top_k]

    return similarities


def warm_cache(similarities: Dict[int, List[Tuple[int, float]]]) -> None:
    # Store the whole similarity map; small shops will be fine in memory
    # For larger catalogs, shard per product key
    cache.set(PRODUCT_SIM_CACHE_KEY, similarities, timeout=60 * 60)


def get_similar_products(product_id: int, limit: int = 8) -> List[int]:
    sims = cache.get(PRODUCT_SIM_CACHE_KEY)
    if not sims:
        sims = compute_product_similarities(top_k=max(20, limit))
        warm_cache(sims)
    return [pid for pid, _ in sims.get(product_id, [])[:limit]]


def get_user_recent_products(user_id: int) -> List[int]:
    # Always fetch fresh cart state to avoid recommending items already in cart
    return list(
        Cart.objects.filter(user_id=user_id).order_by("-created_at").values_list("product_id", flat=True)
    )


def recommend_for_user_cart(user_id: int, limit: int = 8) -> List[int]:
    # For a user's cart, merge similar sets for the items in cart
    product_ids = get_user_recent_products(user_id)
    if not product_ids:
        # Fallback: popular/best_selling
        return list(
            Product.objects.filter(in_stock=True).order_by("-best_selling", "-featured").values_list("id", flat=True)[:limit]
        )

    agg_scores: Dict[int, float] = defaultdict(float)
    sims_cache = cache.get(PRODUCT_SIM_CACHE_KEY, {})
    for pid in product_ids:
        for sid, score in sims_cache.get(pid, []):
            if sid in product_ids:
                continue
            agg_scores[sid] += score

    if not agg_scores:
        # compute on the fly if cache empty
        sims = compute_product_similarities(top_k=max(20, limit))
        warm_cache(sims)
        for pid in product_ids:
            for sid, score in sims.get(pid, []):
                if sid in product_ids:
                    continue
                agg_scores[sid] += score

    ranked = sorted(agg_scores.items(), key=lambda x: x[1], reverse=True)
    return [sid for sid, _ in ranked[:limit]]


