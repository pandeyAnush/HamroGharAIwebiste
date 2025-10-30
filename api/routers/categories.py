"""
Categories API endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from api.models import CategoryResponse, CategoryCreate, ProductResponse
from api.auth_utils import get_current_user
from store.models import Category, Product
from django.contrib.auth.models import User
from typing import List

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories():
    """Get all categories"""
    categories = Category.objects.all()
    return [CategoryResponse.from_orm(category) for category in categories]

@router.get("/{category_slug}", response_model=CategoryResponse)
async def get_category(category_slug: str):
    """Get a specific category by slug"""
    try:
        category = Category.objects.get(slug=category_slug)
        return CategoryResponse.from_orm(category)
    except Category.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

@router.get("/{category_slug}/products", response_model=List[ProductResponse])
async def get_category_products(
    category_slug: str,
    limit: int = 20,
    featured_only: bool = False
):
    """Get products in a specific category"""
    try:
        category = Category.objects.get(slug=category_slug)
        queryset = Product.objects.filter(category=category, in_stock=True)
        
        if featured_only:
            queryset = queryset.filter(featured=True)
        
        products = queryset[:limit]
        
        result = []
        for product in products:
            product_data = ProductResponse.from_orm(product)
            product_data.discount_percentage = product.get_discount_percentage()
            if product.image:
                product_data.image = product.image.url
            result.append(product_data)
        
        return result
        
    except Category.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new category (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can create categories"
        )
    
    try:
        # Check if slug already exists
        if Category.objects.filter(slug=category_data.slug).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
        
        category = Category.objects.create(
            name=category_data.name,
            slug=category_data.slug,
            description=category_data.description,
            icon=category_data.icon
        )
        
        return CategoryResponse.from_orm(category)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating category: {str(e)}"
        )

@router.put("/{category_slug}", response_model=CategoryResponse)
async def update_category(
    category_slug: str,
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user)
):
    """Update a category (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can update categories"
        )
    
    try:
        category = Category.objects.get(slug=category_slug)
        
        # Update fields
        category.name = category_data.name
        category.slug = category_data.slug
        category.description = category_data.description
        category.icon = category_data.icon
        category.save()
        
        return CategoryResponse.from_orm(category)
        
    except Category.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category: {str(e)}"
        )

@router.delete("/{category_slug}")
async def delete_category(
    category_slug: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a category (admin only)"""
    # Check if user is staff/admin
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff members can delete categories"
        )
    
    try:
        category = Category.objects.get(slug=category_slug)
        
        # Check if category has products
        if Product.objects.filter(category=category).exists():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete category with existing products"
            )
        
        category.delete()
        
        return {"message": "Category deleted successfully"}
        
    except Category.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        )
