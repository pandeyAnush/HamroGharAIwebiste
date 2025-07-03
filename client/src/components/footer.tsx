import { Separator } from "@/components/ui/separator";
import { Bolt } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bolt className="text-hamaroghara-primary text-2xl" />
              <span className="text-2xl font-bold">HamaroGhara</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for all household and professional tools. Quality products at affordable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-hamaroghara-primary transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-hamaroghara-primary transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-hamaroghara-primary transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => window.location.href = "/"}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Power Bolt
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Hand Bolt
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Home Appliances
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Gardening Bolt
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => window.location.href = "/track-order"}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Shipping Info
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-gray-700" />
        <div className="text-center">
          <p className="text-gray-400">&copy; 2024 HamaroGhara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
