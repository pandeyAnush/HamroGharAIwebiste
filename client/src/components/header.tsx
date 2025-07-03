import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bolt, 
  Search, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Package, 
  User, 
  LogOut 
} from "lucide-react";
import { CartWithProduct, WishlistWithProduct } from "@shared/schema";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems } = useQuery<CartWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated,
  });

  const { data: wishlistItems } = useQuery<WishlistWithProduct[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Bolt className="text-hamaroghara-primary text-2xl" />
              <span className="text-2xl font-bold text-gray-800">HamaroGhara</span>
            </div>
            
            <div className="hidden md:flex items-center flex-1 max-w-xl">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search for household tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hamaroghara-primary"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-hamaroghara-primary text-white px-3 py-1 rounded"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {user?.firstName || user?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-hamaroghara-primary"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.location.href = "/wishlist"}
                    className="relative p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => window.location.href = "/track-order"}
                    className="relative p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors"
                  >
                    <Truck className="h-5 w-5" />
                    <span className="hidden sm:inline ml-1">Track Order</span>
                  </button>
                  <button
                    onClick={() => window.location.href = "/cart"}
                    className="relative p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-hamaroghara-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => window.location.href = "/orders"}
                    className="hidden sm:block p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors"
                  >
                    <Package className="h-5 w-5" />
                    <span className="ml-1">My Orders</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = "/api/login"}
                  className="text-gray-600 hover:text-hamaroghara-primary"
                >
                  Login
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = "/api/login"}
                  className="text-gray-600 hover:text-hamaroghara-primary"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for household tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hamaroghara-primary"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-hamaroghara-primary text-white px-3 py-1 rounded"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
