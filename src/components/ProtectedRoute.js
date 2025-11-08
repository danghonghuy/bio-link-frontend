// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  // Nếu không có người dùng hiện tại, chuyển hướng đến trang đăng nhập
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị các route con (ví dụ: DashboardLayout)
  return <Outlet />;
};

export default ProtectedRoute;