import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';

export const MenuPage: React.FC = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { data: menuData, isLoading, error } = useMenu();
  const { addToCart, totalItems, totalPrice } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        <p>Failed to load menu</p>
        <button onClick={() => window.location.reload()} className="mt-4 underline">Retry</button>
      </div>
    );
  }

  const { categories, menuItems } = menuData;

  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === activeCategory);

  const handleAddToCart = (item: any) => {
    addToCart(item);
    toast.success(`Add ${item.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-900">Scan To Order  Menu</h1>
          </div>
          <div className="text-sm text-gray-500">
            Table {tableId ? tableId.slice(0,4) : 'Unknown'}
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="max-w-3xl mx-auto px-4 py-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2 rounded-full font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-48 object-cover object-center"
                />
              ) : (
                <div className="w-full h-48 bg-orange-100 flex items-center justify-center text-orange-300">
                  <UtensilsCrossed size={48} />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <span className="font-semibold text-orange-600">${item.price.toFixed(2)}</span>
                  </div>
                  {item.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.is_available}
                  className={`mt-4 w-full py-2.5 rounded-xl font-semibold transition-colors ${
                    item.is_available
                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 active:bg-orange-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {item.is_available ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20 max-w-3xl mx-auto pointer-events-none">
          <button
            onClick={() => navigate(`/table/${tableId}/cart`)}
            className="w-full bg-gray-900 text-white rounded-2xl shadow-xl flex items-center justify-between p-4 pointer-events-auto hover:bg-gray-800 transition-colors transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-800 px-3 py-1 rounded-full font-bold text-orange-400">
                {totalItems}
              </div>
              <span className="font-semibold">View Cart</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-bold">${totalPrice.toFixed(2)}</span>
              <ShoppingCart className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

