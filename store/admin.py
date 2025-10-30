from django.contrib import admin
from .models import Category, Product, Cart, Wishlist, Order, OrderItem, Payment

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'original_price', 'in_stock', 'featured', 'best_selling', 'created_at']
    list_filter = ['category', 'in_stock', 'featured', 'best_selling', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['in_stock', 'featured', 'best_selling']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['get_total_price']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_amount', 'tracking_number', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'tracking_number']
    inlines = [OrderItemInline]
    readonly_fields = ['tracking_number']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order', 'payment_method', 'amount', 'payment_status', 'transaction_id', 'created_at']
    list_filter = ['payment_method', 'payment_status', 'created_at']
    search_fields = ['order__id', 'transaction_id']