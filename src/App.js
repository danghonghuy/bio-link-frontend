import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// --- BƯỚC 1: IMPORT CÁC COMPONENT CẦN THIẾT ---
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Component bảo vệ
import HomePage from './pages/HomePage';
import BioPage from './pages/BioPage';

// Component giả cho trang Login để ví dụ
const LoginPage = () => <div style={{ padding: '2rem' }}>Đây là trang đăng nhập</div>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* --- CÁC ROUTE CÔNG KHAI --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* --- CÁC ROUTE ĐƯỢC BẢO VỆ CHO DASHBOARD --- */}
            {/* Bất kỳ route nào bên trong ProtectedRoute đều yêu cầu đăng nhập */}
            <Route element={<ProtectedRoute />}>
              {/* Bọc các trang dashboard bằng DashboardLayout để có sidebar */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* 
                  Khi bạn có các trang mới như Profile, Appearance, 
                  chỉ cần thêm chúng vào đây. Ví dụ:
                  <Route path="/dashboard/profile" element={<ProfilePage />} />
                  <Route path="/dashboard/appearance" element={<AppearancePage />} />
                */}
              </Route>
            </Route>

            {/* Route cho trang bio công khai nên đặt gần cuối */}
            <Route path="/:slug" element={<BioPage />} />
            
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;