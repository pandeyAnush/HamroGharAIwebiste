import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import HeroBanner from "@/components/hero-banner";
import ProductGrid from "@/components/product-grid";
import CategoryGrid from "@/components/category-grid";
import Footer from "@/components/footer";
import MobileMenu from "@/components/mobile-menu";
import { ProductWithCategory, Category } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: bestSellingProducts, isLoading: bestSellingLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "bestSelling"],
    queryFn: async () => {
      const response = await fetch("/api/products?bestSelling=true");
      if (!response.ok) {
        throw new Error("Failed to fetch best selling products");
      }
      return response.json();
    },
  });

  const { data: featuredProducts, isLoading: featuredLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", "featured"],
    queryFn: async () => {
      const response = await fetch("/api/products?featured=true");
      if (!response.ok) {
        throw new Error("Failed to fetch featured products");
      }
      return response.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("POST", "/api/cart", { productId, quantity });
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Product has been added to your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Product has been added to your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add product to wishlist.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const handleAddToWishlist = (productId: number) => {
    addToWishlistMutation.mutate(productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroBanner />
      
      {/* Best Selling Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Best Selling</h2>
            <button className="text-hamaroghara-primary hover:text-hamaroghara-dark transition-colors">
              See All →
            </button>
          </div>
          
          <ProductGrid
            products={bestSellingProducts || []}
            loading={bestSellingLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Categories</h2>
            <button className="text-hamaroghara-primary hover:text-hamaroghara-dark transition-colors">
              See All →
            </button>
          </div>
          
          <CategoryGrid categories={categories || []} loading={categoriesLoading} />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
            <button className="text-hamaroghara-primary hover:text-hamaroghara-dark transition-colors">
              See All →
            </button>
          </div>
          
          <ProductGrid
            products={featuredProducts || []}
            loading={featuredLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
          />
        </div>
      </section>

      <Footer />
      <MobileMenu />
    </div>
  );
}
