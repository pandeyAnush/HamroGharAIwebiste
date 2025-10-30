from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from django.core.cache import cache

from .models import Product

PRODUCT_SUBCAT_CACHE_KEY = "store:product_subcategories:v1"


def _build_corpus() -> Dict[int, List[int]]:
    # category_id -> [product_id, ...]
    data: Dict[int, List[int]] = defaultdict(list)
    for p in Product.objects.all().only("id", "category_id"):
        data[p.category_id or 0].append(p.id)
    return data


def _texts_for_products(prod_ids: List[int]) -> List[str]:
    id_to_text: Dict[int, str] = {}
    for p in Product.objects.filter(id__in=prod_ids).only("id", "name", "description"):
        name = p.name or ""
        desc = p.description or ""
        id_to_text[p.id] = f"{name}. {desc}"
    # maintain original order
    return [id_to_text[i] for i in prod_ids]


def train_and_cache_subcategories() -> Dict[int, int]:
    """Train per-category KMeans clusters on product text and cache mapping.

    Returns a dict: product_id -> subcategory_label (int)
    """
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.cluster import KMeans
    except Exception:
        # If sklearn isn't available, store empty mapping
        mapping: Dict[int, int] = {}
        cache.set(PRODUCT_SUBCAT_CACHE_KEY, mapping, timeout=60 * 60)
        return mapping

    cat_to_products = _build_corpus()
    product_to_label: Dict[int, int] = {}

    for cat_id, prod_ids in cat_to_products.items():
        if len(prod_ids) <= 1:
            if prod_ids:
                product_to_label[prod_ids[0]] = 0
            continue

        texts = _texts_for_products(prod_ids)
        vectorizer = TfidfVectorizer(stop_words="english", max_features=4096, ngram_range=(1, 2))
        X = vectorizer.fit_transform(texts)

        # Heuristic: number of clusters based on catalog size for this category
        # Ensure at least 2 and at most 8
        k = max(2, min(8, max(2, len(prod_ids) // 4)))
        try:
            model = KMeans(n_clusters=k, n_init=10, random_state=42)
            labels = model.fit_predict(X)
        except Exception:
            # Fallback to single cluster if KMeans fails
            labels = [0] * len(prod_ids)

        for pid, label in zip(prod_ids, labels):
            # Namespace label by category to avoid collisions
            product_to_label[pid] = (cat_id << 8) + int(label)

    cache.set(PRODUCT_SUBCAT_CACHE_KEY, product_to_label, timeout=60 * 60)
    return product_to_label


def get_product_subcategory(product_id: int) -> int:
    mapping: Dict[int, int] = cache.get(PRODUCT_SUBCAT_CACHE_KEY) or {}
    if product_id in mapping:
        return mapping[product_id]

    # Train on demand
    mapping = train_and_cache_subcategories()
    return mapping.get(product_id, -1)


