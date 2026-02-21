import React, { useState } from 'react';
import { useMenu } from '../../hooks/useMenu';
import { supabase } from '../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const MenuManager: React.FC = () => {
  const { data: menuData, isLoading } = useMenu();
  const queryClient = useQueryClient();
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    is_available: true
  });

  const resetForm = () => {
    setFormData({ name: '', category_id: '', description: '', price: '', image_url: '', is_available: true });
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const saveItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, price: parseFloat(data.price) };
      if (editingItem) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('menu_items').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success(editingItem ? 'Item updated' : 'Item added');
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to save item'),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Item deleted');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      toast.success('Image uploaded');
    } catch (error: any) {
      toast.error('Error uploading image');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url || '',
      is_available: item.is_available
    });
    setIsAddingItem(true);
  };

  if (isLoading || !menuData) return <div className="p-8"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
        <button
          onClick={() => { resetForm(); setIsAddingItem(true); }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center"
        >
          <Plus size={20} className="mr-2" /> Add Item
        </button>
      </div>

      {isAddingItem && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'New Menu Item'}</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveItemMutation.mutate(formData); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Select a category</option>
                  {menuData.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="rounded text-orange-500 focus:ring-orange-500 w-5 h-5" />
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center space-x-4">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="url" placeholder="Or enter image URL directly" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 mb-2 text-sm" />
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                      {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />}
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button type="submit" disabled={saveItemMutation.isPending} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
                {saveItemMutation.isPending ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Item List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {menuData.menuItems.map(item => (
            <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center transition-colors">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  {!item.is_available && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Hidden</span>}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  <span className="font-semibold text-orange-600">${item.price.toFixed(2)}</span>
                  <span className="mx-2">•</span>
                  {menuData.categories.find(c => c.id === item.category_id)?.name}
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => { if(confirm('Delete this item?')) deleteItemMutation.mutate(item.id) }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
          {menuData.menuItems.length === 0 && (
            <li className="p-8 text-center text-gray-500">No menu items found. Add your first item!</li>
          )}
        </ul>
      </div>
    </div>
  );
};
