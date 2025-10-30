from django.core.management.base import BaseCommand

from ...subcategory_model import train_and_cache_subcategories


class Command(BaseCommand):
    help = "Train TF-IDF + KMeans subcategory model and cache product->subcategory mapping"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Training subcategory model..."))
        mapping = train_and_cache_subcategories()
        self.stdout.write(self.style.SUCCESS(f"Subcategory mapping cached for {len(mapping)} products."))


