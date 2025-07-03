import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MobileMenu from "@/components/mobile-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Package, MapPin, CheckCircle, Clock } from "lucide-react";
import { OrderWithItems } from "@shared/schema";

export default function TrackOrder() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchedTracking, setSearchedTracking] = useState("");

  // Get tracking number from URL if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingFromUrl = urlParams.get("tracking");
    if (trackingFromUrl) {
      setTrackingNumber(trackingFromUrl);
      setSearchedTracking(trackingFromUrl);
    }
  }, []);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      setSearchedTracking(trackingNumber.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { label: "Order Placed", icon: CheckCircle, completed: true },
      { label: "Processing", icon: Clock, completed: false },
      { label: "Shipped", icon: Truck, completed: false },
      { label: "Delivered", icon: Package, completed: false },
    ];

    switch (status.toLowerCase()) {
      case "processing":
        steps[1].completed = true;
        break;
      case "shipped":
        steps[1].completed = true;
        steps[2].completed = true;
        break;
      case "delivered":
        steps[1].completed = true;
        steps[2].completed = true;
        steps[3].completed = true;
        break;
    }

    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Find order by tracking number
  const trackedOrder = orders?.find(order => order.trackingNumber === searchedTracking);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hamaroghara-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Truck className="text-hamaroghara-primary mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Track Your Order</h1>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Tracking Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                type="text"
                placeholder="Enter your tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                className="bg-hamaroghara-primary text-white hover:bg-hamaroghara-dark transition-colors"
              >
                Track Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {searchedTracking && (
          <>
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hamaroghara-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for your order...</p>
              </div>
            ) : trackedOrder ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Order #{trackedOrder.id}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDate(trackedOrder.createdAt?.toString() || "")}
                        </p>
                        <p className="text-sm text-gray-600">
                          Tracking: {trackedOrder.trackingNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(trackedOrder.status)}>
                          {trackedOrder.status.toUpperCase()}
                        </Badge>
                        <p className="text-lg font-semibold text-gray-800 mt-2">
                          Rs. {trackedOrder.total}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Tracking Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getTrackingSteps(trackedOrder.status).map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                          <div
                            key={index}
                            className={`flex items-center space-x-4 p-4 rounded-lg ${
                              step.completed 
                                ? "bg-green-50 border border-green-200" 
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className={`p-2 rounded-full ${
                              step.completed 
                                ? "bg-green-100 text-green-600" 
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={`font-medium ${
                                step.completed ? "text-green-800" : "text-gray-600"
                              }`}>
                                {step.label}
                              </p>
                              {step.completed && (
                                <p className="text-sm text-green-600">Completed</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trackedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={item.product.imageUrl || "/placeholder-image.jpg"}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × Rs. {item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2" size={20} />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Shipping Address:</p>
                        <p className="text-sm text-gray-600">{trackedOrder.shippingAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Estimated Delivery:</p>
                        <p className="text-sm text-gray-600">
                          {trackedOrder.status === "delivered" 
                            ? "Delivered" 
                            : "3-5 business days from order date"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-6">
                  We couldn't find an order with tracking number "{searchedTracking}". 
                  Please check the tracking number and try again.
                </p>
                <Button 
                  onClick={() => {
                    setSearchedTracking("");
                    setTrackingNumber("");
                  }}
                  className="bg-hamaroghara-primary text-white hover:bg-hamaroghara-dark transition-colors"
                >
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
      <MobileMenu />
    </div>
  );
}
