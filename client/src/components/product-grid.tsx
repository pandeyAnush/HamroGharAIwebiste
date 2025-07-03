import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ShoppingCart } from "lucide-react";
import { ProductWithCategory } from "@shared/schema";

interface ProductGridProps {
  products: ProductWithCategory[];
  loading: boolean;
  onAddToCart: (productId: number) => void;
  onAddToWishlist: (productId: number) => void;
}

export default function ProductGrid({ products, loading, onAddToCart, onAddToWishlist }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex items-center space-x-2 mb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
          <div className="relative group">
            <img
              src={product.imageUrl || "/placeholder-image.jpg"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => onAddToWishlist(product.id)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            >
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            </button>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
            <div className="flex items-center space-x-2 mb-3">
              {product.originalPrice && (
                <span className="text-gray-500 line-through text-sm">
                  Rs. {product.originalPrice}
                </span>
              )}
              <span className="text-hamaroghara-primary font-bold">
                Rs. {product.price}
              </span>
            </div>
            <Button
              onClick={() => onAddToCart(product.id)}
              className="w-full bg-hamaroghara-primary text-white hover:bg-hamaroghara-dark transition-colors"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
