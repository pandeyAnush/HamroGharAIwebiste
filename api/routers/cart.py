"""
Cart API endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from api.models import CartItemResponse, CartItemCreate, CartItemUpdate, SuccessResponse
from api.auth_utils import get_current_user
from store.models import Cart, Product
from django.contrib.auth.models import User
from typing import List

router = APIRouter()

@router.get("/", response_model=List[CartItemResponse])
async def get_cart_items(current_user: User = Depends(get_current_user)):
    """Get user's cart items"""
    cart_items = Cart.objects.filter(user=current_user).select_related('product')
    
    result = []
    for item in cart_items:
        item_data = CartItemResponse.from_orm(item)
        item_data.total_price = item.get_total_price()
        result.append(item_data)
    
    return result

@router.post("/add", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate,
    current_user: User = Depends(get_current_user)
):
    """Add item to cart"""
    try:
        product = Product.objects.get(id=cart_item.product_id)
        
        if not product.in_stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is out of stock"
            )
        
        # Check if item already exists in cart
        cart_item_obj, created = Cart.objects.get_or_create(
            user=current_user,
            product=product,
            defaults={'quantity': cart_item.quantity}
        )
        
        if not created:
            # Update quantity if item already exists
            cart_item_obj.quantity += cart_item.quantity
            cart_item_obj.save()
        
        response = CartItemResponse.from_orm(cart_item_obj)
        response.total_price = cart_item_obj.get_total_price()
        
        return response
        
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding to cart: {str(e)}"
        )

@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    cart_item_update: CartItemUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update cart item quantity"""
    try:
        cart_item = Cart.objects.get(id=item_id, user=current_user)
        
        if cart_item_update.quantity <= 0:
            cart_item.delete()
            raise HTTPException(
                status_code=status.HTTP_200_OK,
                detail="Item removed from cart"
            )
        
        cart_item.quantity = cart_item_update.quantity
        cart_item.save()
        
        response = CartItemResponse.from_orm(cart_item)
        response.total_price = cart_item.get_total_price()
        
        return response
        
    except Cart.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating cart item: {str(e)}"
        )

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user)
):
    """Remove item from cart"""
    try:
        cart_item = Cart.objects.get(id=item_id, user=current_user)
        cart_item.delete()
        
        return SuccessResponse(message="Item removed from cart")
        
    except Cart.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing from cart: {str(e)}"
        )

@router.delete("/")
async def clear_cart(current_user: User = Depends(get_current_user)):
    """Clear all items from cart"""
    try:
        Cart.objects.filter(user=current_user).delete()
        
        return SuccessResponse(message="Cart cleared successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing cart: {str(e)}"
        )

@router.get("/count")
async def get_cart_count(current_user: User = Depends(get_current_user)):
    """Get total number of items in cart"""
    count = Cart.objects.filter(user=current_user).count()
    return {"count": count}

@router.get("/total")
async def get_cart_total(current_user: User = Depends(get_current_user)):
    """Get total price of items in cart"""
    cart_items = Cart.objects.filter(user=current_user)
    total = sum(item.get_total_price() for item in cart_items)
    return {"total": total}
