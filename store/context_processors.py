from .models import Cart

def cart_context(request):
    cart_count = 0
    if request.user.is_authenticated:
        cart_count = Cart.objects.filter(user=request.user).count()
    
    return {
        'cart_count': cart_count,
    }