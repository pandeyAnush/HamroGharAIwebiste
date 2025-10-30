"""
Pydantic models for API serialization
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Base models
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    slug: str

class CategoryResponse(CategoryBase):
    id: int
    slug: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    in_stock: bool = True
    featured: bool = False
    best_selling: bool = False

class ProductCreate(ProductBase):
    slug: str
    category_id: int

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    original_price: Optional[Decimal] = None
    in_stock: Optional[bool] = None
    featured: Optional[bool] = None
    best_selling: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    slug: str
    category_id: int
    image: Optional[str] = None
    discount_percentage: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProductWithCategory(ProductResponse):
    category: CategoryResponse

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    total_price: Decimal
    created_at: datetime
    
    class Config:
        from_attributes = True

class WishlistItemResponse(BaseModel):
    id: int
    product: ProductResponse
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: Decimal

class OrderItemResponse(OrderItemBase):
    id: int
    product: ProductResponse
    total_price: Decimal
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_address: str
    payment_method: str

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class OrderResponse(OrderBase):
    id: int
    status: str
    total_amount: Decimal
    tracking_number: Optional[str] = None
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: int
    payment_method: str
    amount: Decimal
    payment_status: str
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    date_joined: datetime
    
    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    user: UserResponse
    profile_picture: Optional[str] = None
    
    class Config:
        from_attributes = True

# Response models for pagination
class PaginatedResponse(BaseModel):
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[dict]

# Error models
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Success response
class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None
