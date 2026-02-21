import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export interface CartItem extends MenuItem {
  cartItemId: string; // unique local ID in case same item added multiple times
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  table_id: string;
  status: OrderStatus;
  total_amount: number;
  customer_note?: string;
  created_at: string;
  tables?: { table_number: string };
  order_items?: OrderItemDisplay[];
}

export interface OrderItemDisplay {
  quantity: number;
  unit_price: number;
  notes?: string;
  menu_items?: { name: string };
}

export interface Table {
  id: string;
  table_number: string;
}

// Zod schemas for form validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sort_order: z.number().int().min(0, 'Sort order must be 0 or positive'),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  image_url: z.string().optional(),
  is_available: z.boolean().default(true),
});
