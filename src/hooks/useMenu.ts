import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Category, MenuItem } from '../types';

export const useMenu = () => {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // Fetch menu items
      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*');

      if (itemsError) throw itemsError;

      return {
        categories: categories as Category[],
        menuItems: menuItems as MenuItem[],
      };
    },
  });
};

export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true });
        
      if (error) throw error;
      return data;
    },
  });
};
