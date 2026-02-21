import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { usePlaceOrder } from '../hooks/useOrders';
import { useTables } from '../hooks/useMenu';
import { Minus, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { data: tables } = useTables();
  const placeOrder = usePlaceOrder();
  
  const [customerNote, setCustomerNote] = useState('');

  // Validate table
  const currentTable = tables?.find((t) => t.table_number === tableId || t.id === tableId);

  const handlePlaceOrder = async () => {
    if (!currentTable) {
      toast.error('Invalid table ID');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      const order = await placeOrder.mutateAsync({
        tableId: currentTable.id,
        cart,
        totalAmount: totalPrice,
        customerNote,
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/table/${tableId}/order/${order.id}`);
    } catch (error) {
      console.error('Order failed:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate(`/table/${tableId}`)}
            className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.cartItemId} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="font-semibold text-orange-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">${item.price.toFixed(2)} each</p>
                <div className="flex items-center justify-between">
                  <div className="flexItems-center space-x-3 bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="w-8 h-8 rounded-full bg-white text-gray-600 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="w-8 h-8 rounded-full bg-white text-gray-600 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Add a note to your order
          </label>
          <textarea
            id="notes"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 resize-none p-3 border text-sm"
            placeholder="Any allergies or special requests?"
          />
        </div>
      </div>

      {/* Checkout Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-gray-600">Total ({totalItems} items)</span>
            <span className="text-2xl font-bold pl-4 text-gray-900">${totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placeOrder.isPending || !tables}
            className="w-full bg-orange-500 text-white rounded-xl py-4 font-bold text-lg hover:bg-orange-600 transition-colors flex justify-center items-center gap-2 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
