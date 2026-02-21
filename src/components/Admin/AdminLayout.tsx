import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListOrdered, UtensilsCrossed, QrCode, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard / Orders', href: '/admin/orders', icon: ListOrdered },
    { name: 'Menu Management', href: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Tables & QR codes', href: '/admin/tables', icon: QrCode },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center space-x-3">
          <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          <span className="text-xl font-bold">AntiGravity OS</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-400 hover:text-white w-full px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
            <span className="text-lg font-bold">AntiGravity</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden bg-gray-800 px-2 py-3 flex space-x-2 overflow-x-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex whitespace-nowrap items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-orange-500 text-white' : 'text-gray-300 bg-gray-700'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
