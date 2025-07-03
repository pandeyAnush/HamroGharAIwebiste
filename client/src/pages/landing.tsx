import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Bolt, 
  Star, 
  ShoppingCart, 
  Heart, 
  Search,
  Wrench,
  Car,
  Monitor,
  Fan,
  Plug,
  Leaf,
  Hammer,
  Lightbulb,
  Bike,
  HardHat,
  Brush
} from "lucide-react";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Sample data for the landing page
  const bestSellingProducts = [
    {
      id: 1,
      name: "Gasoline Chainsaw",
      originalPrice: "Rs. 5500.00",
      salePrice: "Rs. 5000.00",
      image: "https://images.unsplash.com/photo-1583416750470-965b2707b355?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 2,
      name: "High Pressure Washer",
      originalPrice: "Rs. 6000.00",
      salePrice: "Rs. 5000.00",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 3,
      name: "Switch Sticks Cane",
      originalPrice: "Rs. 3000.00",
      salePrice: "Rs. 5000.00",
      image: "https://images.unsplash.com/photo-1631044797825-a24e23c9076d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 4,
      name: "Table Saw",
      originalPrice: "Rs. 4500.00",
      salePrice: "Rs. 5000.00",
      image: "https://pixabay.com/get/g63bd3f60aecedd8fb1768fe01157a98581abab9261020f82d2259b7803965d0f4b5331379b6a28378370ca4c0dfb14491f55c48bcd5fd13849b30ae29f7f7ca3_1280.jpg"
    }
  ];

  const featuredProducts = [
    {
      id: 5,
      name: "Professional Power Drill",
      originalPrice: "Rs. 7500.00",
      salePrice: "Rs. 6000.00",
      image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: 6,
      name: "Lawn Mower",
      originalPrice: "Rs. 12000.00",
      salePrice: "Rs. 10000.00",
      image: "https://pixabay.com/get/g56ce1df537cd0214b1e44ac29a459b0bc0536cd4ae90e7da03d8134d7d25d4fa55ebd410bbca912d1f6025f8a6e37f0455e987d48c6ea12dcbb6193fb22a1665_1280.jpg"
    },
    {
      id: 7,
      name: "Complete Tool Set",
      originalPrice: "Rs. 4500.00",
      salePrice: "Rs. 3500.00",
      image: "https://pixabay.com/get/g1fecaf34f666a4141411aae4c9df7994c1432fa492c788e249cc2b364e2fb32cd68f9cf2b1890f55c729d544040963a7ca1d7948b75ffeca88325b782e3c4182_1280.jpg"
    },
    {
      id: 8,
      name: "Kitchen Stand Mixer",
      originalPrice: "Rs. 8500.00",
      salePrice: "Rs. 7000.00",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
    }
  ];

  const categories = [
    { name: "Bathroom-Hardware", icon: Wrench },
    { name: "Car-Accessories", icon: Car },
    { name: "Computer Hardware", icon: Monitor },
    { name: "Cooling Machine", icon: Fan },
    { name: "Electrical-Tool", icon: Plug },
    { name: "Gardening-Bolt", icon: Leaf },
    { name: "Hand-Bolt", icon: Bolt },
    { name: "Home-Appliances", icon: Brush },
    { name: "Lights-Accessories", icon: Lightbulb },
    { name: "Bike Accessories", icon: Bike },
    { name: "Power-Bolt", icon: Hammer },
    { name: "Safety-Welding-Equipment", icon: HardHat }
  ];

  const handleLoginClick = () => {
    window.location.href = "/api/login";
  };

  const handleSignUpClick = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                  <input 
                    type="text" 
                    placeholder="Search for household tools..." 
                    className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hamaroghara-primary"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-hamaroghara-primary text-white px-3 py-1 rounded">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={handleLoginClick}
                  className="text-gray-600 hover:text-hamaroghara-primary"
                >
                  Login
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignUpClick}
                  className="text-gray-600 hover:text-hamaroghara-primary"
                >
                  Sign Up
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="relative p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors">
                  <Heart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>
                <button className="relative p-2 text-gray-600 hover:text-hamaroghara-primary transition-colors">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-hamaroghara-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:hidden pb-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for household tools..." 
                className="w-full py-2 pl-4 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hamaroghara-primary"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-hamaroghara-primary text-white px-3 py-1 rounded">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-hamaroghara-primary to-hamaroghara-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">CHAINSAW</h1>
              <p className="text-xl mb-2">POWER THROUGH ANY PROJECT FOR</p>
              <p className="text-xl mb-4">TOUGHEST JOBS</p>
              <p className="text-2xl font-bold mb-6">UP TO 30% OFF</p>
              <Button 
                onClick={handleLoginClick}
                className="bg-white text-hamaroghara-primary px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                SHOP NOW
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://pixabay.com/get/g8fd95940631641202d126bf27f0db63da6a495be75eddba72f8bb75b78254a7215c9806026f5236f36b7722660941fcacfd7e2d224bef06da14641f6c8bb64d9_1280.jpg" 
                alt="Professional chainsaw for heavy-duty jobs" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
              <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 text-hamaroghara-primary px-3 py-1 rounded text-sm font-semibold">
                Chainsaw 3
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
            <div className="w-3 h-3 bg-white rounded-full opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Best Selling */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Best Selling</h2>
            <button className="text-hamaroghara-primary hover:text-hamaroghara-dark transition-colors">
              See All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellingProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
                    <span className="text-hamaroghara-primary font-bold">{product.salePrice}</span>
                  </div>
                  <Button 
                    onClick={handleLoginClick}
                    className="w-full bg-hamaroghara-primary text-white hover:bg-hamaroghara-dark transition-colors"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.name} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="text-3xl text-hamaroghara-primary mb-3 flex justify-center">
                    <IconComponent />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
                </Card>
              );
            })}
          </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-gray-500 line-through text-sm">{product.originalPrice}</span>
                    <span className="text-hamaroghara-primary font-bold">{product.salePrice}</span>
                  </div>
                  <Button 
                    onClick={handleLoginClick}
                    className="w-full bg-hamaroghara-primary text-white hover:bg-hamaroghara-dark transition-colors"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bolt className="text-hamaroghara-primary text-2xl" />
                <span className="text-2xl font-bold">HamaroGhara</span>
              </div>
              <p className="text-gray-400 mb-4">Your trusted partner for all household and professional tools. Quality products at affordable prices.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Power Bolt</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Hand Bolt</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home Appliances</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gardening Bolt</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Track Your Order</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          <div className="text-center">
            <p className="text-gray-400">&copy; 2024 HamaroGhara. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
