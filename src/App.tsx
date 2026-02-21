import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { OrderSuccess } from './pages/OrderSuccess';
import { AdminLogin } from './pages/Admin/AdminLogin';
import { OrderList } from './pages/Admin/OrderList';
import { MenuManager } from './pages/Admin/MenuManager';
import { TableQR } from './pages/Admin/TableQR';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/Admin/AdminLayout';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/" element={<Navigate to="/admin" />} />
      <Route path="/table/:tableId" element={<MenuPage />} />
      <Route path="/table/:tableId/cart" element={<CartPage />} />
      <Route path="/table/:tableId/order/:orderId" element={<OrderSuccess />} />

      {/* Admin Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="tables" element={<TableQR />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-500 mb-6">Page not found</p>
        </div>
      } />
    </Routes>
  );
};

export default App;
