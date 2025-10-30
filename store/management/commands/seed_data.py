from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store.models import Category, Product
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        # Create admin user if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@hamaroghara.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create categories
        categories_data = [
            {'name': 'Power Tools', 'slug': 'power-tools', 'description': 'Electric and cordless power tools for professional and DIY use', 'icon': '🔌'},
            {'name': 'Hand Tools', 'slug': 'hand-tools', 'description': 'Essential hand tools for every household and workshop', 'icon': '🔧'},
            {'name': 'Kitchen Tools', 'slug': 'kitchen-tools', 'description': 'Modern kitchen gadgets and appliances', 'icon': '🍳'},
            {'name': 'Garden Tools', 'slug': 'garden-tools', 'description': 'Gardening equipment and outdoor tools', 'icon': '🌱'},
            {'name': 'Cleaning Tools', 'slug': 'cleaning-tools', 'description': 'Professional cleaning equipment and supplies', 'icon': '🧽'},
            {'name': 'Safety Equipment', 'slug': 'safety-equipment', 'description': 'Personal protective equipment and safety gear', 'icon': '🛡️'},
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create products
        products_data = [
            # Power Tools
            {'name': 'Cordless Drill Driver Kit', 'slug': 'cordless-drill-driver-kit', 'category': 'power-tools', 'price': 89.99, 'original_price': 119.99, 'description': 'Professional 18V cordless drill with two batteries and charger. Perfect for drilling and driving screws.', 'featured': True, 'best_selling': True},
            {'name': 'Circular Saw 7.25"', 'slug': 'circular-saw-725', 'category': 'power-tools', 'price': 149.99, 'original_price': 179.99, 'description': 'Powerful circular saw with laser guide for precise cuts. Ideal for cutting lumber and plywood.', 'featured': True},
            {'name': 'Random Orbital Sander', 'slug': 'random-orbital-sander', 'category': 'power-tools', 'price': 79.99, 'description': 'Variable speed orbital sander for smooth finishing. Includes dust collection system.', 'best_selling': True},
            
            # Hand Tools
            {'name': 'Socket Wrench Set 42-Piece', 'slug': 'socket-wrench-set-42-piece', 'category': 'hand-tools', 'price': 49.99, 'original_price': 69.99, 'description': 'Complete socket set with ratcheting handles. Includes both metric and imperial sizes.', 'featured': True},
            {'name': 'Hammer Claw 16oz', 'slug': 'hammer-claw-16oz', 'category': 'hand-tools', 'price': 24.99, 'description': 'Classic claw hammer with ergonomic grip. Essential tool for every toolbox.', 'best_selling': True},
            {'name': 'Screwdriver Set 6-Piece', 'slug': 'screwdriver-set-6-piece', 'category': 'hand-tools', 'price': 19.99, 'description': 'Premium screwdriver set with magnetic tips. Includes Phillips and flathead varieties.'},
            
            # Kitchen Tools
            {'name': 'Stand Mixer 5-Quart', 'slug': 'stand-mixer-5-quart', 'category': 'kitchen-tools', 'price': 299.99, 'original_price': 399.99, 'description': 'Professional-grade stand mixer with multiple attachments. Perfect for baking and cooking.', 'featured': True, 'best_selling': True},
            {'name': 'Food Processor 12-Cup', 'slug': 'food-processor-12-cup', 'category': 'kitchen-tools', 'price': 159.99, 'description': 'Large capacity food processor with multiple blades. Chops, slices, and shreds with ease.', 'featured': True},
            {'name': 'Knife Set Professional 8-Piece', 'slug': 'knife-set-professional-8-piece', 'category': 'kitchen-tools', 'price': 89.99, 'original_price': 129.99, 'description': 'High-quality stainless steel knife set with wooden block. Includes all essential kitchen knives.'},
            
            # Garden Tools
            {'name': 'Hedge Trimmer Electric', 'slug': 'hedge-trimmer-electric', 'category': 'garden-tools', 'price': 79.99, 'description': 'Lightweight electric hedge trimmer with 22-inch blade. Perfect for maintaining hedges and shrubs.', 'best_selling': True},
            {'name': 'Garden Hose 50ft Heavy Duty', 'slug': 'garden-hose-50ft-heavy-duty', 'category': 'garden-tools', 'price': 39.99, 'original_price': 59.99, 'description': 'Durable garden hose with brass fittings. Kink-resistant and weather-resistant design.'},
            {'name': 'Pruning Shears Professional', 'slug': 'pruning-shears-professional', 'category': 'garden-tools', 'price': 29.99, 'description': 'Sharp bypass pruning shears for clean cuts. Comfortable grip and safety lock included.', 'featured': True},
            
            # Cleaning Tools
            {'name': 'Vacuum Cleaner Cordless', 'slug': 'vacuum-cleaner-cordless', 'category': 'cleaning-tools', 'price': 199.99, 'original_price': 249.99, 'description': 'Powerful cordless vacuum with multiple attachments. Perfect for quick cleanups and detailed cleaning.', 'featured': True, 'best_selling': True},
            {'name': 'Pressure Washer 1800 PSI', 'slug': 'pressure-washer-1800-psi', 'category': 'cleaning-tools', 'price': 149.99, 'description': 'Electric pressure washer for outdoor cleaning. Great for decks, driveways, and vehicles.'},
            
            # Safety Equipment
            {'name': 'Safety Glasses Clear Lens', 'slug': 'safety-glasses-clear-lens', 'category': 'safety-equipment', 'price': 12.99, 'description': 'ANSI-rated safety glasses with anti-fog coating. Essential protection for workshop activities.', 'best_selling': True},
            {'name': 'Work Gloves Heavy Duty', 'slug': 'work-gloves-heavy-duty', 'category': 'safety-equipment', 'price': 15.99, 'description': 'Cut-resistant work gloves with excellent grip. Available in multiple sizes for comfort and protection.'},
        ]

        for prod_data in products_data:
            category = Category.objects.get(slug=prod_data.pop('category'))
            product_data = prod_data.copy()
            product_data['category'] = category
            
            product, created = Product.objects.get_or_create(
                slug=product_data['slug'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))