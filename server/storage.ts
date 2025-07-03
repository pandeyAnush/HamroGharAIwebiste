import {
  users,
  categories,
  products,
  cart,
  wishlist,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Category,
  type Product,
  type Cart,
  type Wishlist,
  type Order,
  type OrderItem,
  type ProductWithCategory,
  type CartWithProduct,
  type WishlistWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;

  // Product operations
  getProducts(): Promise<ProductWithCategory[]>;
  getProductById(id: number): Promise<ProductWithCategory | undefined>;
  getProductsByCategory(categoryId: number): Promise<ProductWithCategory[]>;
  getFeaturedProducts(): Promise<ProductWithCategory[]>;
  getBestSellingProducts(): Promise<ProductWithCategory[]>;
  searchProducts(query: string): Promise<ProductWithCategory[]>;

  // Cart operations
  getCartItems(userId: string): Promise<CartWithProduct[]>;
  addToCart(userId: string, productId: number, quantity: number): Promise<Cart>;
  updateCartItem(userId: string, productId: number, quantity: number): Promise<Cart>;
  removeFromCart(userId: string, productId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wishlist operations
  getWishlistItems(userId: string): Promise<WishlistWithProduct[]>;
  addToWishlist(userId: string, productId: number): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  isInWishlist(userId: string, productId: number): Promise<boolean>;

  // Order operations
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getOrderById(orderId: number, userId: string): Promise<OrderWithItems | undefined>;
  createOrder(userId: string, total: number, shippingAddress: string): Promise<Order>;
  addOrderItem(orderId: number, productId: number, quantity: number, price: number): Promise<OrderItem>;
  updateOrderStatus(orderId: number, status: string, trackingNumber?: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  // Product operations
  async getProducts(): Promise<ProductWithCategory[]> {
    return await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));
  }

  async getProductById(id: number): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.products,
      category: result.categories,
    };
  }

  async getProductsByCategory(categoryId: number): Promise<ProductWithCategory[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.categoryId, categoryId));
    
    return results.map(result => ({
      ...result.products,
      category: result.categories,
    }));
  }

  async getFeaturedProducts(): Promise<ProductWithCategory[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.featured, true));
    
    return results.map(result => ({
      ...result.products,
      category: result.categories,
    }));
  }

  async getBestSellingProducts(): Promise<ProductWithCategory[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.bestSelling, true));
    
    return results.map(result => ({
      ...result.products,
      category: result.categories,
    }));
  }

  async searchProducts(query: string): Promise<ProductWithCategory[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.name, query)); // Simplified search, you can enhance this
    
    return results.map(result => ({
      ...result.products,
      category: result.categories,
    }));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartWithProduct[]> {
    const results = await db
      .select()
      .from(cart)
      .leftJoin(products, eq(cart.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cart.userId, userId));
    
    return results.map(result => ({
      ...result.cart,
      product: {
        ...result.products!,
        category: result.categories,
      },
    }));
  }

  async addToCart(userId: string, productId: number, quantity: number): Promise<Cart> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cart)
        .set({ quantity: existingItem.quantity + quantity })
        .where(and(eq(cart.userId, userId), eq(cart.productId, productId)))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db
        .insert(cart)
        .values({ userId, productId, quantity })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(userId: string, productId: number, quantity: number): Promise<Cart> {
    const [updatedItem] = await db
      .update(cart)
      .set({ quantity })
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)))
      .returning();
    return updatedItem;
  }

  async removeFromCart(userId: string, productId: number): Promise<void> {
    await db
      .delete(cart)
      .where(and(eq(cart.userId, userId), eq(cart.productId, productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistWithProduct[]> {
    const results = await db
      .select()
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(wishlist.userId, userId));
    
    return results.map(result => ({
      ...result.wishlist,
      product: {
        ...result.products!,
        category: result.categories,
      },
    }));
  }

  async addToWishlist(userId: string, productId: number): Promise<Wishlist> {
    const [newItem] = await db
      .insert(wishlist)
      .values({ userId, productId })
      .returning();
    return newItem;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
  }

  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return !!item;
  }

  // Order operations
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const ordersResult = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      ordersResult.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items: items.map(item => ({
            ...item.order_items,
            product: item.products!,
          })),
        };
      })
    );

    return ordersWithItems;
  }

  async getOrderById(orderId: number, userId: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)));

    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return {
      ...order,
      items: items.map(item => ({
        ...item.order_items,
        product: item.products!,
      })),
    };
  }

  async createOrder(userId: string, total: number, shippingAddress: string): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({ userId, total, shippingAddress })
      .returning();
    return order;
  }

  async addOrderItem(orderId: number, productId: number, quantity: number, price: number): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values({ orderId, productId, quantity, price })
      .returning();
    return item;
  }

  async updateOrderStatus(orderId: number, status: string, trackingNumber?: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status, trackingNumber, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
