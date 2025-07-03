import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wrench,
  Car,
  Monitor,
  Fan,
  Plug,
  Leaf,
  Bolt,
  Brush,
  Lightbulb,
  Bike,
  Hammer,
  HardHat
} from "lucide-react";
import { Category } from "@shared/schema";

interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
}

const categoryIconMap: Record<string, any> = {
  "bathroom-hardware": Wrench,
  "car-accessories": Car,
  "computer-hardware": Monitor,
  "cooling-machine": Fan,
  "electrical-tool": Plug,
  "gardening-tools": Leaf,
  "hand-tools": Bolt,
  "home-appliances": Brush,
  "lights-accessories": Lightbulb,
  "motorcycle-accessories": Bike,
  "power-tools": Hammer,
  "safety-welding-equipment": HardHat,
};

export default function CategoryGrid({ categories, loading }: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="p-6 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-3" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => {
        const IconComponent = categoryIconMap[category.slug] || Bolt;
        return (
          <Card
            key={category.id}
            className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              // Navigate to category page
              window.location.href = `/category/${category.slug}`;
            }}
          >
            <div className="text-3xl text-hamaroghara-primary mb-3 flex justify-center">
              <IconComponent />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">{category.name}</h3>
          </Card>
        );
      })}
    </div>
  );
}
