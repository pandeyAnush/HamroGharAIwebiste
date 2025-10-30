"""
Products API endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from django.core.paginator import Paginator
from django.db.models import Q
from typing import Optional, List
from api.models import ProductResponse, ProductWithCategory, ProductCreate, ProductUpdate, PaginatedResponse
from api.auth_utils import get_current_user_optional, get_current_user
from store.models import Product, Category
from django.contrib.auth.models import User

router = APIRouter()

@router.get("/", response_model=PaginatedResponse)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    best_selling: Optional[bool] = None,
    in_stock: Optional[bool] = None,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Get all products with filtering and pagination"""
    queryset = Product.objects.select_related('category').all()
    
    # Apply filters
    if category:
        queryset = queryset.filter(category__slug=category)
    
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    
    if featured is not None:
        queryset = queryset.filter(featured=featured)
    
    if best_selling is not None:
        queryset = queryset.filter(best_selling=best_selling)
    
    if in_stock is not None:
        queryset = queryset.filter(in_stock=in_stock)
    
    # Pagination
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    
    # Convert to response format
    products = []
    for product in page_obj:
        product_data = ProductResponse.from_orm(product)
        product_data.discount_percentage = product.get_discount_percentage()
        if product.image:
            product_data.image = product.image.url
        products.append(product_data.dict())
    
    return PaginatedResponse(
        count=paginator.count,
        next=f"/api/products/?page={page + 1}&page_size={page_size}" if page_obj.has_next() else None,
        previous=f"/api/products/?page={page - 1}&page_size={page_size}" if page_obj.has_previous() else None,
        results=products
    )

@router.get("/{product_slug}", response_model=ProductWithCategory)
async def get_product(product_slug: str):
    """Get a specific product by slug"""
    try:
        product = Product.objects.select_related('category').get(slug=product_slug)
        
        # Create response
        product_data = ProductWithCategory.from_orm(product)
        product_data.discount_percentage = product.get_discount_percentage()
        if product.image:
            product_data.image = product.image.url
        
        return product_data
        
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

@router.get("/featured/list", response_model=List[ProductResponse])
async def get_featured_products(limit: int = Query(10, ge=1, le=50)):
    """Get featured products"""
    products = Product.objects.filter(featured=True, in_stock=True)[:limit]
    
    result = []
    for product in products:
        product_data = ProductResponse.from_orm(product)
        product_data.discount_percentage = product.get_discount_percentage()
        if product.image:
            product_data.image = product.image.url
        result.append(product_data)
    
    return result

@router.get("/bestselling/list", response_model=List[ProductResponse])
async def get_best_selling_products(limit: int = Query(10, ge=1, le=50)):
    """Get best selling products"""
    products = Product.objects.filter(best_selling=True, in_stock=True)[:limit]
    
    result = []
    for product in products:
        product_data = ProductResponse.from_orm(product)
        product_data.discount_percentage = product.get_discount_percentage()
        if product.image:
            product_data.image = product.image.url
        result.append(product_data)
    
    return result

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new product (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can create products"
        )
    
    try:
        # Verify category exists
        category = Category.objects.get(id=product_data.category_id)
        
        # Create product
        product = Product.objects.create(
            name=product_data.name,
            slug=product_data.slug,
            category=category,
            description=product_data.description,
            price=product_data.price,
            original_price=product_data.original_price,
            in_stock=product_data.in_stock,
            featured=product_data.featured,
            best_selling=product_data.best_selling
        )
        
        response = ProductResponse.from_orm(product)
        response.discount_percentage = product.get_discount_percentage()
        if product.image:
            response.image = product.image.url
        
        return response
        
    except Category.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )

@router.put("/{product_slug}", response_model=ProductResponse)
async def update_product(
    product_slug: str,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a product (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can update products"
        )
    
    try:
        product = Product.objects.get(slug=product_slug)
        
        # Update fields
        update_data = product_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.save()
        
        response = ProductResponse.from_orm(product)
        response.discount_percentage = product.get_discount_percentage()
        if product.image:
            response.image = product.image.url
        
        return response
        
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product: {str(e)}"
        )

@router.delete("/{product_slug}")
async def delete_product(
    product_slug: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a product (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can delete products"
        )
    
    try:
        product = Product.objects.get(slug=product_slug)
        product.delete()
        
        return {"message": "Product deleted successfully"}
        
    except Product.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting product: {str(e)}"
        )
