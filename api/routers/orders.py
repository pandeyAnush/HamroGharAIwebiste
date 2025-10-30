"""
Orders API endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from api.models import OrderResponse, OrderCreate, OrderItemResponse, PaymentResponse, SuccessResponse
from api.auth_utils import get_current_user
from store.models import Order, OrderItem, Payment, Cart, Product
from django.contrib.auth.models import User
from django.db import transaction
from typing import List
import uuid
from asgiref.sync import sync_to_async

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
async def get_user_orders(current_user: User = Depends(get_current_user)):
    """Get user's orders"""
    def fetch_orders_sync() -> List[Order]:
        return list(Order.objects.filter(user=current_user).prefetch_related('items__product'))

    orders = await sync_to_async(fetch_orders_sync)()

    result: List[OrderResponse] = []
    for order in orders:
        order_data = OrderResponse.from_orm(order)
        order_data.items = [OrderItemResponse.from_orm(item) for item in order.items.all()]
        result.append(order_data)

    return result

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get a specific order"""
    try:
        def get_order_sync():
            return Order.objects.prefetch_related('items__product').get(
                id=order_id, user=current_user
            )

        order = await sync_to_async(get_order_sync)()

        order_data = OrderResponse.from_orm(order)
        order_data.items = [OrderItemResponse.from_orm(item) for item in order.items.all()]

        return order_data
        
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new order from cart items"""
    try:
        def create_order_sync() -> Order:
            with transaction.atomic():
                cart_items = Cart.objects.filter(user=current_user).select_related('product')
                if not cart_items.exists():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cart is empty"
                    )

                total_amount = sum(item.get_total_price() for item in cart_items)

                order = Order.objects.create(
                    user=current_user,
                    shipping_address=order_data.shipping_address,
                    total_amount=total_amount,
                    status='pending'
                )

                for cart_item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price=cart_item.product.price
                    )

                Payment.objects.create(
                    order=order,
                    payment_method=order_data.payment_method,
                    amount=total_amount,
                    payment_status='pending'
                )

                cart_items.delete()
                return order

        order = await sync_to_async(create_order_sync)()

        order_resp = OrderResponse.from_orm(order)
        order_resp.items = [OrderItemResponse.from_orm(item) for item in order.items.all()]

        return order_resp
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user)
):
    """Update order status (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can update order status"
        )
    
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        async def update_status_async():
            order = await sync_to_async(Order.objects.get)(id=order_id)
            order.status = status
            await sync_to_async(order.save)()
        
        await update_status_async()

        return SuccessResponse(message=f"Order status updated to {status}")
        
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(e)}"
        )

@router.put("/{order_id}/tracking")
async def update_tracking_number(
    order_id: int,
    tracking_number: str,
    current_user: User = Depends(get_current_user)
):
    """Update order tracking number (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can update tracking numbers"
        )
    
    try:
        async def update_tracking_async():
            order = await sync_to_async(Order.objects.get)(id=order_id)
            order.tracking_number = tracking_number
            await sync_to_async(order.save)()

        await update_tracking_async()

        return SuccessResponse(message="Tracking number updated successfully")
        
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating tracking number: {str(e)}"
        )

@router.get("/{order_id}/payment", response_model=PaymentResponse)
async def get_order_payment(
    order_id: int,
    current_user: User = Depends(get_current_user)
):
    """Get payment information for an order"""
    try:
        async def get_payment_async():
            order = await sync_to_async(Order.objects.get)(id=order_id, user=current_user)
            payment = await sync_to_async(Payment.objects.get)(order=order)
            return payment

        payment = await get_payment_async()

        return PaymentResponse.from_orm(payment)
        
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    except Payment.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )

@router.put("/{order_id}/payment/status")
async def update_payment_status(
    order_id: int,
    payment_status: str,
    transaction_id: str = None,
    current_user: User = Depends(get_current_user)
):
    """Update payment status (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can update payment status"
        )
    
    valid_statuses = ['pending', 'completed', 'failed', 'refunded']
    if payment_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        async def update_payment_async():
            order = await sync_to_async(Order.objects.get)(id=order_id)
            payment = await sync_to_async(Payment.objects.get)(order=order)
            payment.payment_status = payment_status
            if transaction_id:
                payment.transaction_id = transaction_id
            await sync_to_async(payment.save)()

        await update_payment_async()

        return SuccessResponse(message=f"Payment status updated to {payment_status}")
        
    except Order.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    except Payment.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating payment status: {str(e)}"
        )
