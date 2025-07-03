import { useAuth } from "@/hooks/useAuth";
import { Home, User, Package, Grid3X3, ShoppingCart } from "lucide-react";

export default function MobileMenu() {
  const { isAuthenticated } = useAuth();

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t md:hidden z-50">
      <div className="flex justify-around py-2">
        <button
          onClick={() => handleNavigation("/")}
          className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        {isAuthenticated ? (
          <>
            <button
              onClick={() => handleNavigation("/cart")}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Cart</span>
            </button>
            <button
              onClick={() => handleNavigation("/orders")}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
            >
              <Package className="h-5 w-5" />
              <span className="text-xs mt-1">Orders</span>
            </button>
            <button
              onClick={() => window.location.href = "/api/logout"}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Account</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => window.location.href = "/api/login"}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Login</span>
            </button>
            <button
              onClick={() => window.location.href = "/api/login"}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-hamaroghara-primary transition-colors"
            >
              <Grid3X3 className="h-5 w-5" />
              <span className="text-xs mt-1">Register</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
