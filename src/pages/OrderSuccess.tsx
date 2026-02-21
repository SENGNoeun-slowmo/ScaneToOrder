import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails } from '../hooks/useOrders';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Clock, CheckCircle, ChefHat, ArrowLeft } from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderSuccess: React.FC = () => {
  const { tableId, orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderDetails(orderId);
  const [liveStatus, setLiveStatus] = useState<OrderStatus>(order?.status || 'pending');

  useEffect(() => {
    if (order) {
      setLiveStatus(order.status);
    }
  }, [order]);

  // Real-time listener for just this order
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`public:orders:id=eq.${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setLiveStatus(payload.new.status as OrderStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-lg mb-4">Order not found</p>
        <button
          onClick={() => navigate(`/table/${tableId}`)}
          className="text-orange-500 underline flex items-center"
        >
          <ArrowLeft className="mr-2" size={20} /> Return to Menu
        </button>
      </div>
    );
  }

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock className="w-12 h-12 text-blue-500" />, text: 'Order Received', color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'preparing':
        return { icon: <ChefHat className="w-12 h-12 text-orange-500" />, text: 'Preparing', color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'ready':
        return { icon: <CheckCircle className="w-12 h-12 text-green-500" />, text: 'Ready', color: 'text-green-500', bg: 'bg-green-50' };
      case 'completed':
        return { icon: <CheckCircle2 className="w-12 h-12 text-gray-500" />, text: 'Completed', color: 'text-gray-500', bg: 'bg-gray-50' };
      case 'cancelled':
        return { icon: <Clock className="w-12 h-12 text-red-500" />, text: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50' };
    }
  };

  const statusInfo = getStatusDisplay(liveStatus);

  return (
    <div className="min-h-screen bg-gray-50 pt-12 px-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${statusInfo.bg}`}>
            {statusInfo.icon}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${statusInfo.color}`}>{statusInfo.text}</h1>
          <p className="text-gray-500 mb-6 font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          
          <div className="bg-gray-50 rounded-2xl p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Order Summary</h3>
            <ul className="space-y-3 mb-4">
              {order.order_items?.map((item, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    <span className="font-medium mr-2">{item.quantity}x</span>
                    {item.menu_items?.name}
                  </span>
                  <span className="font-medium text-gray-900">${(item.quantity * item.unit_price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-lg text-orange-600">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/table/${tableId}`)}
          className="w-full bg-white text-gray-900 border border-gray-200 rounded-xl py-4 font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          New Order
        </button>
      </div>
    </div>
  );
};
