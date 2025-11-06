import React from 'react';

export default function LandingPage({ onSignIn }) {
  return (
    <div className="text-center pt-20 max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
        Tạo Bio Link chuyên nghiệp cho riêng bạn
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        Tất cả các liên kết của bạn, ở cùng một nơi. Đơn giản, miễn phí và mãi mãi.
      </p>
      <button 
        onClick={onSignIn} 
        className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl transition-transform transform hover:scale-105"
      >
        🚀 Bắt đầu miễn phí với Google
      </button>
    </div>
  );
}