// src/context/AuthContext.js

import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

// Đây là một "custom hook" để component con dễ dàng lấy thông tin
export function useAuth() {
  return useContext(AuthContext);
}

// Đây là "nhà cung cấp" (Provider), nó sẽ bao bọc toàn bộ ứng dụng
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged là một trình nghe (listener) của Firebase
    // Nó sẽ tự động được gọi mỗi khi có sự thay đổi về trạng thái đăng nhập
    // (đăng nhập thành công, đăng xuất, hoặc khi refresh trang)
    const unsubscribe = onAuthStateChanged(auth, user => {
      // 'user' sẽ là object chứa thông tin user nếu đã đăng nhập,
      // hoặc là 'null' nếu đã đăng xuất.
      setCurrentUser(user);
      setLoading(false); // Đánh dấu là đã tải xong trạng thái ban đầu
    });

    // Hàm dọn dẹp: gỡ bỏ trình nghe khi component bị unmount
    return unsubscribe;
  }, []); // [] đảm bảo useEffect này chỉ chạy 1 lần duy nhất

  // Giá trị mà Context sẽ cung cấp cho các component con
  const value = {
    currentUser,
  };

  // Chỉ render các component con khi đã xác định được trạng thái đăng nhập
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}