import React from 'react';
import { FaGoogle, FaGithub, FaFacebook, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { signInWithGoogle, signInWithGitHub, signInWithFacebook } from '../firebase';

export default function LandingPage({ onSignIn, authMessage }) {
  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Miễn phí mãi mãi
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Tất cả liên kết của bạn
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              tại một nơi
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tạo trang bio link chuyên nghiệp trong vài giây. Chia sẻ tất cả nội dung của bạn với một liên kết duy nhất.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaCheckCircle className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Dễ dàng tùy chỉnh</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaCheckCircle className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Phân tích chi tiết</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FaCheckCircle className="text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Hoàn toàn miễn phí</span>
          </div>
        </div>

        {/* Auth Message */}
        {authMessage && (
          <div className="max-w-md mx-auto mb-6 animate-shake">
            <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex-shrink-0 mt-0.5">
                <FaExclamationCircle className="text-red-500 text-lg" />
              </div>
              <p className="text-sm font-medium text-red-800 text-left">
                {authMessage}
              </p>
            </div>
          </div>
        )}

        {/* Auth Buttons */}
        <div className="max-w-md mx-auto space-y-3">
          <p className="text-sm font-semibold text-gray-500 mb-4">Bắt đầu với</p>
          
          <button 
            onClick={() => onSignIn(signInWithGoogle)} 
            className="group w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 flex items-center justify-between shadow-sm hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span>Tiếp tục với Google</span>
            </div>
            <FaArrowRight className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
          </button>

          <button 
            onClick={() => onSignIn(signInWithGitHub)} 
            className="group w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-between shadow-lg shadow-gray-900/30 hover:shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <FaGithub className="text-gray-900 text-xl" />
              </div>
              <span>Tiếp tục với GitHub</span>
            </div>
            <FaArrowRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
          </button>
          
          <button 
            onClick={() => onSignIn(signInWithFacebook)} 
            className="group w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-between shadow-lg shadow-blue-500/30 hover:shadow-xl"
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
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Điều khoản dịch vụ</a>
            {' '}và{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Chính sách bảo mật</a>
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