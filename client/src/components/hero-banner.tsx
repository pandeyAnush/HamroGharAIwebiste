import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-hamaroghara-primary to-hamaroghara-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">CHAINSAW</h1>
            <p className="text-xl mb-2">POWER THROUGH ANY PROJECT FOR</p>
            <p className="text-xl mb-4">TOUGHEST JOBS</p>
            <p className="text-2xl font-bold mb-6">UP TO 30% OFF</p>
            <Button className="bg-white text-hamaroghara-primary px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
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
  );
}
