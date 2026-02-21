import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  ClipboardList, 
  UtensilsCrossed, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Assuming you have auth set up

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login'); // or wherever your admin login is
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
    { icon: UtensilsCrossed, label: 'Menu Items', path: '/admin/menu' },
    { icon: Users, label: 'Staff / Tables', path: '/admin/staff' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:flex lg:flex-col`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:justify-center">
            <div className="flex items-center">
              <ChefHat className="h-10 w-10 text-orange-500" />
              <span className="ml-3 text-2xl font-bold text-gray-900 hidden lg:block">Admin</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-6 h-6 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Optional top bar / breadcrumbs */}
            <div className="mb-8 hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>

            <Outlet /> {/* Nested routes render here */}
          </div>
        </main>
      </div>
    </div>
  );
};