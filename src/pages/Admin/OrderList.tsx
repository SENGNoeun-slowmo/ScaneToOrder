import React, { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { OrderStatus } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Clock, ChefHat, CheckCircle, XCircle, ListOrdered } from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderList: React.FC = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const filteredOrders = orders?.filter((order) => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.status);
    if (filter === 'completed') return ['completed', 'cancelled'].includes(order.status);
    return true;
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Live Orders</h1>
        
        <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              filter === 'active' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              filter === 'completed' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              filter === 'all' ? 'bg-gray-900 text-white shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders?.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-gray-900">
                    {order.tables?.table_number || 'Takeaway'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-orange-600">
                  ${order.total_amount.toFixed(2)}
                </span>
                <div className="text-xs text-gray-400 font-mono mt-1">
                  #{order.id.slice(0, 6).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 bg-white">
              <ul className="space-y-3 mb-4">
                {order.order_items?.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start">
                    <div className="flex items-start">
                      <span className="font-bold text-gray-900 mr-2 bg-gray-100 px-2 py-0.5 rounded text-sm">
                        {item.quantity}x
                      </span>
                      <div>
                        <span className="font-medium text-gray-800">{item.menu_items?.name}</span>
                        {item.notes && (
                          <p className="text-xs text-orange-600 mt-0.5 italic">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {order.customer_note && (
                <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-800 mt-4 border border-orange-100">
                  <strong>Customer Note:</strong> {order.customer_note}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
              {order.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange(order.id, 'preparing')}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <ChefHat className="w-4 h-4 mr-2" /> Accept & Prepare
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => handleStatusChange(order.id, 'ready')}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Ready
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => handleStatusChange(order.id, 'completed')}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Complete Order
                </button>
              )}
              {['pending', 'preparing'].includes(order.status) && (
                <button
                  onClick={() => handleStatusChange(order.id, 'cancelled')}
                  className="px-4 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-semibold flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredOrders?.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            <ListOrdered className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-lg font-medium">No orders found for this view</p>
          </div>
        )}
      </div>
    </div>
  );
};
