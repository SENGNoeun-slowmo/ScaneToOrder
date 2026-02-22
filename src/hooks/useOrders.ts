import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CartItem, Order, OrderStatus } from '../types';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async ({
      tableId,
      cart,
      totalAmount,
      customerNote,
    }: {
      tableId: string;
      cart: CartItem[];
      totalAmount: number;
      customerNote?: string;
    }) => {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          total_amount: totalAmount,
          customer_note: customerNote,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Notify backend for Telegram alert
      try {
        await fetch(`${API_URL}/orders/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            tableNumber: tableId,   // controller will use this as table label
            totalAmount,
            customerNote,
            timestamp: order.created_at || new Date().toISOString(),
            items: cart.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes,
            })),
          }),
        });
      } catch (err) {
        console.warn('Failed to notify backend, but order was placed', err);
      }

      return order;
    },
  });
};

export const useOrderDetails = (orderId?: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number),
          order_items (
            quantity,
            unit_price,
            notes,
            menu_items (name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
};

// Admin hook for real-time orders list
export const useAdminOrders = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        // Invalidate orders queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number),
          order_items (
            quantity,
            unit_price,
            notes,
            menu_items (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_orders'] });
      // Depending on view, might also need to invalidate individual orders
    }
  });
};
