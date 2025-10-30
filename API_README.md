# Hamaro Ghara Store API

This is a FastAPI-based REST API for the Hamaro Ghara Store Django application. The API provides endpoints for managing products, categories, cart, orders, and user authentication.

## Features

- **Authentication**: JWT-based authentication with login/register endpoints
- **Products**: CRUD operations for products with filtering and pagination
- **Categories**: Manage product categories
- **Cart**: Add, update, remove items from shopping cart
- **Orders**: Create and manage orders with payment tracking
- **Documentation**: Auto-generated API documentation with Swagger UI

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run database migrations:
```bash
python manage.py migrate
```

3. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

## Running the API

### Option 1: Using the run script
```bash
python run_api.py
```

### Option 2: Using uvicorn directly
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at:
- **API Base URL**: http://localhost:8001/api/
- **Interactive API Docs**: http://localhost:8001/api/docs
- **ReDoc Documentation**: http://localhost:8001/api/redoc
- **Django Admin**: http://localhost:8001/django/admin/

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products/` - List all products (with filtering and pagination)
- `GET /api/products/{slug}` - Get product by slug
- `GET /api/products/featured/list` - Get featured products
- `GET /api/products/bestselling/list` - Get best selling products
- `POST /api/products/` - Create product (admin only)
- `PUT /api/products/{slug}` - Update product (admin only)
- `DELETE /api/products/{slug}` - Delete product (admin only)

### Categories
- `GET /api/categories/` - List all categories
- `GET /api/categories/{slug}` - Get category by slug
- `GET /api/categories/{slug}/products` - Get products in category
- `POST /api/categories/` - Create category (admin only)
- `PUT /api/categories/{slug}` - Update category (admin only)
- `DELETE /api/categories/{slug}` - Delete category (admin only)

### Cart
- `GET /api/cart/` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/{item_id}` - Update cart item quantity
- `DELETE /api/cart/{item_id}` - Remove item from cart
- `DELETE /api/cart/` - Clear cart
- `GET /api/cart/count` - Get cart item count
- `GET /api/cart/total` - Get cart total

### Orders
- `GET /api/orders/` - Get user orders
- `GET /api/orders/{id}` - Get specific order
- `POST /api/orders/` - Create new order
- `PUT /api/orders/{id}/status` - Update order status (admin only)
- `PUT /api/orders/{id}/tracking` - Update tracking number (admin only)
- `GET /api/orders/{id}/payment` - Get payment info
- `PUT /api/orders/{id}/payment/status` - Update payment status (admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Login using `/api/auth/login` to get an access token
2. Include the token in the Authorization header: `Bearer <your_token>`

Example:
```bash
curl -H "Authorization: Bearer your_jwt_token" http://localhost:8000/api/cart/
```

## Query Parameters

### Products Filtering
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)
- `category` - Filter by category slug
- `search` - Search in product name and description
- `featured` - Filter featured products (true/false)
- `best_selling` - Filter best selling products (true/false)
- `in_stock` - Filter in-stock products (true/false)

Example:
```
GET /api/products/?page=1&page_size=10&category=electronics&search=laptop&featured=true
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE"
}
```

### Paginated Response
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

## Development

### Adding New Endpoints

1. Create a new router file in `api/routers/`
2. Define Pydantic models in `api/models.py`
3. Import and include the router in `api/main.py`

### Database Integration

The API uses Django ORM for database operations. All models are defined in `store/models.py` and can be accessed directly in the API endpoints.

### Testing

You can test the API using:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **curl** or **Postman** for custom requests

## Production Deployment

For production deployment:

1. Set `DEBUG = False` in Django settings
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Use a production ASGI server like Gunicorn with Uvicorn workers
5. Set up proper logging and monitoring

Example production command:
```bash
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
