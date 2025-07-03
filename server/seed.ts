import { db } from "./db";
import { categories, products } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(products);
    await db.delete(categories);

    // Seed categories
    const categoryData = [
      {
        name: "Bathroom Hardware",
        slug: "bathroom-hardware",
        icon: "wrench",
        description: "Essential bathroom hardware and fixtures"
      },
      {
        name: "Car Accessories",
        slug: "car-accessories", 
        icon: "car",
        description: "Automotive tools and accessories"
      },
      {
        name: "Computer Hardware",
        slug: "computer-hardware",
        icon: "monitor",
        description: "Computer parts and accessories"
      },
      {
        name: "Cooling Machine",
        slug: "cooling-machine",
        icon: "fan",
        description: "Cooling and ventilation equipment"
      },
      {
        name: "Electrical Tool",
        slug: "electrical-tool",
        icon: "plug",
        description: "Electrical tools and equipment"
      },
      {
        name: "Gardening Tools",
        slug: "gardening-tools",
        icon: "leaf",
        description: "Garden and landscaping tools"
      },
      {
        name: "Hand Tools",
        slug: "hand-tools",
        icon: "tools",
        description: "Manual hand tools for various tasks"
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        icon: "blender",
        description: "Household appliances and equipment"
      },
      {
        name: "Lights Accessories",
        slug: "lights-accessories",
        icon: "lightbulb",
        description: "Lighting equipment and accessories"
      },
      {
        name: "Motorcycle Accessories",
        slug: "motorcycle-accessories",
        icon: "motorcycle",
        description: "Motorcycle tools and accessories"
      },
      {
        name: "Power Tools",
        slug: "power-tools",
        icon: "hammer",
        description: "Electric and battery-powered tools"
      },
      {
        name: "Safety Welding Equipment",
        slug: "safety-welding-equipment",
        icon: "hard-hat",
        description: "Welding and safety equipment"
      }
    ];

    const insertedCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Get category IDs for reference
    const categoryMap = new Map(insertedCategories.map(cat => [cat.slug, cat.id]));

    // Seed products
    const productData = [
      // Power Tools
      {
        name: "Gasoline Chainsaw",
        slug: "gasoline-chainsaw",
        description: "Professional gasoline chainsaw for heavy-duty cutting tasks",
        price: "5000.00",
        originalPrice: "5500.00",
        imageUrl: "https://images.unsplash.com/photo-1583416750470-965b2707b355?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("power-tools"),
        inStock: true,
        featured: true,
        bestSelling: true
      },
      {
        name: "Professional Power Drill",
        slug: "professional-power-drill",
        description: "Heavy-duty power drill for construction and DIY projects",
        price: "6000.00",
        originalPrice: "7500.00",
        imageUrl: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("power-tools"),
        inStock: true,
        featured: true,
        bestSelling: false
      },
      {
        name: "Table Saw",
        slug: "table-saw",
        description: "Professional table saw for precise woodworking",
        price: "5000.00",
        originalPrice: "4500.00",
        imageUrl: "https://pixabay.com/get/g63bd3f60aecedd8fb1768fe01157a98581abab9261020f82d2259b7803965d0f4b5331379b6a28378370ca4c0dfb14491f55c48bcd5fd13849b30ae29f7f7ca3_1280.jpg",
        categoryId: categoryMap.get("power-tools"),
        inStock: true,
        featured: false,
        bestSelling: true
      },
      // Home Appliances
      {
        name: "High Pressure Washer",
        slug: "high-pressure-washer",
        description: "High pressure washer for cleaning various surfaces",
        price: "5000.00",
        originalPrice: "6000.00",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("home-appliances"),
        inStock: true,
        featured: false,
        bestSelling: true
      },
      {
        name: "Kitchen Stand Mixer",
        slug: "kitchen-stand-mixer",
        description: "Professional kitchen stand mixer for baking and cooking",
        price: "7000.00",
        originalPrice: "8500.00",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("home-appliances"),
        inStock: true,
        featured: true,
        bestSelling: false
      },
      // Hand Tools
      {
        name: "Switch Sticks Cane",
        slug: "switch-sticks-cane",
        description: "Walking stick and mobility cane for support",
        price: "5000.00",
        originalPrice: "3000.00",
        imageUrl: "https://images.unsplash.com/photo-1631044797825-a24e23c9076d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("hand-tools"),
        inStock: true,
        featured: false,
        bestSelling: true
      },
      {
        name: "Complete Tool Set",
        slug: "complete-tool-set",
        description: "Comprehensive hand tool set for DIY projects",
        price: "3500.00",
        originalPrice: "4500.00",
        imageUrl: "https://pixabay.com/get/g1fecaf34f666a4141411aae4c9df7994c1432fa492c788e249cc2b364e2fb32cd68f9cf2b1890f55c729d544040963a7ca1d7948b75ffeca88325b782e3c4182_1280.jpg",
        categoryId: categoryMap.get("hand-tools"),
        inStock: true,
        featured: true,
        bestSelling: false
      },
      // Gardening Tools
      {
        name: "Lawn Mower",
        slug: "lawn-mower",
        description: "Professional lawn mower for garden maintenance",
        price: "10000.00",
        originalPrice: "12000.00",
        imageUrl: "https://pixabay.com/get/g56ce1df537cd0214b1e44ac29a459b0bc0536cd4ae90e7da03d8134d7d25d4fa55ebd410bbca912d1f6025f8a6e37f0455e987d48c6ea12dcbb6193fb22a1665_1280.jpg",
        categoryId: categoryMap.get("gardening-tools"),
        inStock: true,
        featured: true,
        bestSelling: false
      },
      // Additional household tools
      {
        name: "Electric Drill Set",
        slug: "electric-drill-set",
        description: "Cordless electric drill with multiple bits",
        price: "4500.00",
        originalPrice: "5200.00",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-d24b4ee17887?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("power-tools"),
        inStock: true,
        featured: false,
        bestSelling: false
      },
      {
        name: "Tool Storage Box",
        slug: "tool-storage-box",
        description: "Heavy-duty storage box for organizing tools",
        price: "2500.00",
        originalPrice: "3000.00",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("hand-tools"),
        inStock: true,
        featured: false,
        bestSelling: false
      },
      {
        name: "Hammer Set",
        slug: "hammer-set",
        description: "Professional hammer set for construction work",
        price: "1800.00",
        originalPrice: "2200.00",
        imageUrl: "https://images.unsplash.com/photo-1504148455328-d24b4ee17887?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("hand-tools"),
        inStock: true,
        featured: false,
        bestSelling: false
      },
      {
        name: "Garden Hose",
        slug: "garden-hose",
        description: "Heavy-duty garden hose for watering plants",
        price: "1200.00",
        originalPrice: "1500.00",
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: categoryMap.get("gardening-tools"),
        inStock: true,
        featured: false,
        bestSelling: false
      }
    ];

    const insertedProducts = await db.insert(products).values(productData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };
