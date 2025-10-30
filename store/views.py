from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, update_session_auth_hash
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Product, Category, Cart, Wishlist, Order, OrderItem, Payment, Profile
from .recommender import recommend_for_user_cart, get_similar_products, warm_cache, compute_product_similarities
from .forms import UserUpdateForm, ProfileUpdateForm, CustomPasswordChangeForm
import uuid
from decimal import Decimal

def home(request):
    featured_products = Product.objects.filter(featured=True, in_stock=True)[:8]
    best_selling_products = Product.objects.filter(best_selling=True, in_stock=True)[:8]
    categories = Category.objects.all()[:12]
    
    context = {
        'featured_products': featured_products,
        'best_selling_products': best_selling_products,
        'categories': categories,
    }
    return render(request, 'store/home.html', context)

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, in_stock=True)
    related_products = Product.objects.filter(
        category=product.category, 
        in_stock=True
    ).exclude(id=product.id)[:4]
    
    # Check if product is in user's wishlist
    in_wishlist = False
    if request.user.is_authenticated:
        in_wishlist = Wishlist.objects.filter(user=request.user, product=product).exists()
    
    context = {
        'product': product,
        'related_products': related_products,
        'in_wishlist': in_wishlist,
    }
    return render(request, 'store/product_detail.html', context)

def category_detail(request, slug):
    category = get_object_or_404(Category, slug=slug)
    products = Product.objects.filter(category=category, in_stock=True)
    
    context = {
        'category': category,
        'products': products,
    }
    return render(request, 'store/category_detail.html', context)

def search(request):
    query = request.GET.get('q', '')
    products = []
    
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query),
            in_stock=True
        )
    
    context = {
        'products': products,
        'query': query,
    }
    return render(request, 'store/search_results.html', context)

@login_required
def cart_detail(request):
    cart_items = Cart.objects.filter(user=request.user)
    total = sum(item.get_total_price() for item in cart_items)
    # Recommendations based on user's cart
    recommended_products = []
    if cart_items:
        rec_ids = recommend_for_user_cart(request.user.id, limit=8)
        # Ensure we don't recommend items already in cart
        in_cart_ids = {ci.product_id for ci in cart_items}
        rec_ids = [rid for rid in rec_ids if rid not in in_cart_ids]
        if rec_ids:
            # Keep order same as ranked ids
            products_map = {p.id: p for p in Product.objects.filter(id__in=rec_ids, in_stock=True)}
            recommended_products = [products_map[i] for i in rec_ids if i in products_map]
    
    context = {
        'cart_items': cart_items,
        'total': total,
        'recommended_products': recommended_products,
    }
    return render(request, 'store/cart.html', context)

@login_required
@require_POST
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id, in_stock=True)
    quantity = int(request.POST.get('quantity', 1))
    
    cart_item, created = Cart.objects.get_or_create(
        user=request.user,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        cart_item.quantity += quantity
        cart_item.save()
    
    messages.success(request, f'{product.name} added to cart!')
    # Opportunistically warm recommender cache when cart changes
    try:
        sims = compute_product_similarities(top_k=20)
        warm_cache(sims)
    except Exception:
        # Do not block user flow on recommender errors
        pass
    return redirect('store:cart_detail')

@login_required
def remove_from_cart(request, product_id):
    cart_item = get_object_or_404(Cart, user=request.user, product_id=product_id)
    cart_item.delete()
    messages.success(request, 'Item removed from cart!')
    return redirect('store:cart_detail')

@login_required
@require_POST
def update_cart(request, product_id):
    cart_item = get_object_or_404(Cart, user=request.user, product_id=product_id)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
    else:
        cart_item.delete()
    
    return redirect('store:cart_detail')

@login_required
def clear_cart(request):
    Cart.objects.filter(user=request.user).delete()
    messages.success(request, 'Cart cleared!')
    return redirect('store:cart_detail')

@login_required
def wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user)
    
    context = {
        'wishlist_items': wishlist_items,
    }
    return render(request, 'store/wishlist.html', context)

@login_required
def add_to_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    wishlist_item, created = Wishlist.objects.get_or_create(
        user=request.user,
        product=product
    )
    
    if created:
        messages.success(request, f'{product.name} added to wishlist!')
    else:
        messages.info(request, f'{product.name} is already in your wishlist!')
    
    return redirect(request.META.get('HTTP_REFERER', 'store:home'))

@login_required
def remove_from_wishlist(request, product_id):
    wishlist_item = get_object_or_404(Wishlist, user=request.user, product_id=product_id)
    wishlist_item.delete()
    messages.success(request, 'Item removed from wishlist!')
    return redirect('store:wishlist')

@login_required
def order_list(request):
    orders = Order.objects.filter(user=request.user)
    
    context = {
        'orders': orders,
    }
    return render(request, 'store/orders.html', context)

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    context = {
        'order': order,
    }
    return render(request, 'store/order_detail.html', context)

@login_required
def checkout(request):
    cart_items = Cart.objects.filter(user=request.user)
    
    if not cart_items:
        messages.error(request, 'Your cart is empty!')
        return redirect('store:cart_detail')
    
    total = sum(item.get_total_price() for item in cart_items)
    
    if request.method == 'POST':
        shipping_address = request.POST.get('shipping_address')
        
        if shipping_address:
            # Create order
            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                shipping_address=shipping_address,
                tracking_number=f'HG{uuid.uuid4().hex[:8].upper()}'
            )
            
            # Create order items
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                )
            
            # Clear cart
            cart_items.delete()
            
            # Redirect to payment
            return redirect('store:payment', order_id=order.id)
    
    context = {
        'cart_items': cart_items,
        'total': total,
    }
    return render(request, 'store/checkout.html', context)

@login_required
def payment(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    if request.method == 'POST':
        payment_method = request.POST.get('payment_method')
        
        # Create payment record
        payment = Payment.objects.create(
            order=order,
            payment_method=payment_method,
            amount=order.total_amount,
            payment_status='completed',
            transaction_id=f'TXN{uuid.uuid4().hex[:10].upper()}'
        )
        
        # Update order status
        order.status = 'processing'
        order.save()
        
        messages.success(request, 'Payment successful! Your order is being processed.')
        return redirect('store:payment_success', order_id=order.id)
    
    context = {
        'order': order,
    }
    return render(request, 'store/payment.html', context)

@login_required
def payment_success(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    context = {
        'order': order,
    }
    return render(request, 'store/payment_success.html', context)

def track_order(request):
    tracking_number = request.GET.get('tracking_number', '')
    order = None
    
    if tracking_number:
        try:
            order = Order.objects.get(tracking_number=tracking_number)
        except Order.DoesNotExist:
            messages.error(request, 'Order not found with this tracking number.')
    
    context = {
        'order': order,
        'tracking_number': tracking_number,
    }
    return render(request, 'store/track_order.html', context)

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful! Welcome to HamaroGhara!')
            return redirect('store:home')
    else:
        form = UserCreationForm()
    
    context = {
        'form': form,
    }
    return render(request, 'registration/register.html', context)

@login_required
def profile(request):
    if request.method == 'POST':
        if 'update_profile' in request.POST:
            u_form = UserUpdateForm(request.POST, instance=request.user)
            p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
            if u_form.is_valid() and p_form.is_valid():
                u_form.save()
                p_form.save()
                messages.success(request, 'Your profile has been updated!')
                return redirect('store:profile')
        elif 'change_password' in request.POST:
            password_form = CustomPasswordChangeForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)  # Important!
                messages.success(request, 'Your password was successfully updated!')
                return redirect('store:profile')
            else:
                messages.error(request, 'Please correct the error below.')
    
    u_form = UserUpdateForm(instance=request.user)
    p_form = ProfileUpdateForm(instance=request.user.profile)
    password_form = CustomPasswordChangeForm(request.user)

    context = {
        'u_form': u_form,
        'p_form': p_form,
        'password_form': password_form
    }

    return render(request, 'store/profile.html', context)
