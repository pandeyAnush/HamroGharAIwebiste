from django.core.management.base import BaseCommand

from ...recommender import compute_product_similarities, warm_cache


class Command(BaseCommand):
    help = "Precompute and cache product recommendation similarities"

    def add_arguments(self, parser):
        parser.add_argument("--top-k", type=int, default=20, help="Top K similar products to keep per item")

    def handle(self, *args, **options):
        top_k = options["top_k"]
        self.stdout.write(self.style.NOTICE(f"Computing similarities (top_k={top_k})..."))
        sims = compute_product_similarities(top_k=top_k)
        warm_cache(sims)
        self.stdout.write(self.style.SUCCESS("Recommendation cache warmed."))


