import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// --- Phần sửa đổi ---
// Khởi tạo app TRƯỚC khi sử dụng
const app = initializeApp(firebaseConfig);

// Lấy analytics SAU KHI đã có app (nếu bạn cần dùng)
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

// --- Phần còn lại giữ nguyên ---
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  // Hàm này sẽ mở ra cửa sổ popup đăng nhập của Google
  return signInWithPopup(auth, googleProvider);
};

export const doSignOut = () => {
  // Hàm này để đăng xuất
  return signOut(auth);
};