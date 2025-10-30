"""
Working FastAPI application for Hamaro Ghara Store
"""
import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hamaroghara.settings')
django.setup()

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.wsgi import WSGIMiddleware
from asgiref.sync import sync_to_async
import uvicorn

# Import Django WSGI application
from hamaroghara.wsgi import application as django_app

# Import models
from store.models import Product, Category, Cart, Order
from django.contrib.auth.models import User

# Create FastAPI app
app = FastAPI(
    title="Hamaro Ghara Store API",
    description="API for Hamaro Ghara Store - Your one-stop shop for home essentials",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Django app for web interface
app.mount("/django", WSGIMiddleware(django_app))

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/media", StaticFiles(directory="media"), name="media")

@app.get("/api/")
async def root():
    """Root API endpoint"""
    return {
        "message": "Welcome to Hamaro Ghara Store API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Hamaro Ghara Store API"}

@app.get("/api/categories/")
async def get_categories():
    """Get all categories"""
    try:
        categories = await sync_to_async(list)(Category.objects.all())
        result = []
        for category in categories:
            result.append({
                "id": category.id,
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "icon": category.icon,
                "created_at": category.created_at.isoformat()
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories/{category_slug}")
async def get_category(category_slug: str):
    """Get a specific category by slug"""
    try:
        category = Category.objects.get(slug=category_slug)
        return {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "icon": category.icon,
            "created_at": category.created_at.isoformat()
        }
    except Category.DoesNotExist:
        raise HTTPException(status_code=404, detail="Category not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/")
async def get_products(
    page: int = 1,
    page_size: int = 20,
    category: str = None,
    search: str = None,
    featured: bool = None,
    best_selling: bool = None,
    in_stock: bool = None
):
    """Get all products with filtering and pagination"""
    try:
        def get_products_sync():
            queryset = Product.objects.select_related('category').all()
            
            # Apply filters
            if category:
                queryset = queryset.filter(category__slug=category)
            
            if search:
                queryset = queryset.filter(
                    name__icontains=search
                )
            
            if featured is not None:
                queryset = queryset.filter(featured=featured)
            
            if best_selling is not None:
                queryset = queryset.filter(best_selling=best_selling)
            
            if in_stock is not None:
                queryset = queryset.filter(in_stock=in_stock)
            
            # Pagination
            start = (page - 1) * page_size
            end = start + page_size
            products = list(queryset[start:end])
            total_count = queryset.count()
            
            return products, total_count
        
        products, total_count = await sync_to_async(get_products_sync)()
        
        # Convert to response format
        result = []
        for product in products:
            product_data = {
                "id": product.id,
                "name": product.name,
                "slug": product.slug,
                "description": product.description,
                "price": float(product.price),
                "original_price": float(product.original_price) if product.original_price else None,
                "image": product.image.url if product.image else None,
                "in_stock": product.in_stock,
                "featured": product.featured,
                "best_selling": product.best_selling,
                "category": {
                    "id": product.category.id,
                    "name": product.category.name,
                    "slug": product.category.slug
                },
                "discount_percentage": product.get_discount_percentage(),
                "created_at": product.created_at.isoformat(),
                "updated_at": product.updated_at.isoformat()
            }
            result.append(product_data)
        
        return {
            "count": total_count,
            "page": page,
            "page_size": page_size,
            "results": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/{product_slug}")
async def get_product(product_slug: str):
    """Get a specific product by slug"""
    try:
        product = Product.objects.select_related('category').get(slug=product_slug)
        
        return {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "price": float(product.price),
            "original_price": float(product.original_price) if product.original_price else None,
            "image": product.image.url if product.image else None,
            "in_stock": product.in_stock,
            "featured": product.featured,
            "best_selling": product.best_selling,
            "category": {
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug,
                "description": product.category.description,
                "icon": product.category.icon,
                "created_at": product.category.created_at.isoformat()
            },
            "discount_percentage": product.get_discount_percentage(),
            "created_at": product.created_at.isoformat(),
            "updated_at": product.updated_at.isoformat()
        }
        
    except Product.DoesNotExist:
        raise HTTPException(status_code=404, detail="Product not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/featured/list")
async def get_featured_products(limit: int = 10):
    """Get featured products"""
    try:
        def get_featured_sync():
            return list(Product.objects.filter(featured=True, in_stock=True)[:limit])
        
        products = await sync_to_async(get_featured_sync)()
        
        result = []
        for product in products:
            product_data = {
                "id": product.id,
                "name": product.name,
                "slug": product.slug,
                "description": product.description,
                "price": float(product.price),
                "original_price": float(product.original_price) if product.original_price else None,
                "image": product.image.url if product.image else None,
                "in_stock": product.in_stock,
                "featured": product.featured,
                "best_selling": product.best_selling,
                "discount_percentage": product.get_discount_percentage(),
                "created_at": product.created_at.isoformat()
            }
            result.append(product_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/bestselling/list")
async def get_best_selling_products(limit: int = 10):
    """Get best selling products"""
    try:
        def get_bestselling_sync():
            return list(Product.objects.filter(best_selling=True, in_stock=True)[:limit])
        
        products = await sync_to_async(get_bestselling_sync)()
        
        result = []
        for product in products:
            product_data = {
                "id": product.id,
                "name": product.name,
                "slug": product.slug,
                "description": product.description,
                "price": float(product.price),
                "original_price": float(product.original_price) if product.original_price else None,
                "image": product.image.url if product.image else None,
                "in_stock": product.in_stock,
                "featured": product.featured,
                "best_selling": product.best_selling,
                "discount_percentage": product.get_discount_percentage(),
                "created_at": product.created_at.isoformat()
            }
            result.append(product_data)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "api.working_main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
