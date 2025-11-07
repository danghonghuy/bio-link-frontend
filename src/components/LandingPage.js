import React from 'react';
import { FaGoogle, FaGithub, FaFacebook, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { signInWithGoogle, signInWithGitHub, signInWithFacebook } from '../firebase';

export default function LandingPage({ onSignIn, authMessage }) {
  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center z-10">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-full text-sm font-semibold text-blue-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Miễn phí mãi mãi
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Tất cả liên kết của bạn
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              tại một nơi
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Tạo trang bio link chuyên nghiệp trong vài giây. Chia sẻ tất cả nội dung của bạn với một liên kết duy nhất.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          {[
            { color: 'green', text: 'Dễ dàng tùy chỉnh' },
            { color: 'blue', text: 'Phân tích chi tiết' },
            { color: 'purple', text: 'Hoàn toàn miễn phí' }
          ].map(({ color, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 p-4 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-inner"
            >
              <div className={`bg-${color}-900/40 p-2 rounded-lg`}>
                <FaCheckCircle className={`text-${color}-400`} />
              </div>
              <span className="text-sm font-semibold text-gray-200">{text}</span>
            </div>
          ))}
        </div>

        {/* Auth Message */}
        {authMessage && (
          <div className="max-w-md mx-auto mb-6 animate-shake">
            <div className="flex items-start gap-3 p-4 bg-red-900/40 border-2 border-red-700 rounded-xl text-red-300">
              <FaExclamationCircle className="text-red-400 text-lg" />
              <p className="text-sm font-medium text-left">{authMessage}</p>
            </div>
          </div>
        )}

        {/* Auth Buttons */}
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-sm font-semibold text-gray-400 mb-4">Bắt đầu với</p>
          
          {/* Google */}
          <button 
            onClick={() => onSignIn(signInWithGoogle)} 
            className="group w-full bg-gray-900 hover:bg-gray-800 text-gray-100 font-semibold py-4 px-6 rounded-xl border border-gray-700 hover:border-blue-400 transition-all duration-200 flex items-center justify-between shadow-md hover:shadow-blue-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <FaGoogle className="text-[#4285F4] text-xl" />
              </div>
              <span>Tiếp tục với Google</span>
            </div>
            <FaArrowRight className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
          </button>

          {/* GitHub */}
          <button 
            onClick={() => onSignIn(signInWithGitHub)} 
            className="group w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl border border-gray-700 transition-all duration-200 flex items-center justify-between shadow-md hover:shadow-gray-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <FaGithub className="text-gray-900 text-xl" />
              </div>
              <span>Tiếp tục với GitHub</span>
            </div>
            <FaArrowRight className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
          </button>
          
          {/* Facebook */}
          <button 
            onClick={() => onSignIn(signInWithFacebook)} 
            className="group w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-between shadow-md hover:shadow-blue-500/40"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <FaFacebook className="text-[#1877F2] text-xl" />
              </div>
              <span>Tiếp tục với Facebook</span>
            </div>
            <FaArrowRight className="text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
          </button>

          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Điều khoản dịch vụ</a>
            {' '}và{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium">Chính sách bảo mật</a>
            {' '}của chúng tôi.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
