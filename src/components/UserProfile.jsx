import React, { useState, useRef } from 'react';
import { BiPencil, BiSave, BiX, BiCheck, BiUpload } from 'react-icons/bi';
import { FaUser, FaEnvelope, FaCalendar, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';

const handleImageUpload = async (file) => {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
        return response.data.secure_url;
    } catch (error) {
        console.error("Lỗi tải ảnh lên Cloudinary:", error);
        return null;
    }
};

export default function UserProfile({ profile, currentUser, onProfileUpdate, showToast }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        displayName: profile?.displayName || '',
        description: profile?.description || '',
        avatarUrl: profile?.avatarUrl || currentUser?.photoURL || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        setIsUploadingAvatar(true);
        showToast("Đang tải ảnh lên...", 'info');
        
        const imageUrl = await handleImageUpload(file);
        if (imageUrl) {
            setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
            showToast("Tải ảnh lên thành công", 'success');
        } else {
            showToast('Không thể tải ảnh lên. Vui lòng thử lại', 'error');
        }
        setIsUploadingAvatar(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                ...formData,
                userId: currentUser.uid
            };
            
            // Update avatar
            if (formData.avatarUrl !== profile?.avatarUrl) {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/avatar`, {
                    userId: currentUser.uid,
                    avatarUrl: formData.avatarUrl
                });
            }
            
            // Update profile
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, updateData);
            onProfileUpdate(response.data);
            showToast("Cập nhật hồ sơ thành công!", 'success');
            setIsEditing(false);
        } catch (error) {
            console.error("Lỗi cập nhật hồ sơ:", error);
            showToast("Không thể cập nhật hồ sơ. Vui lòng thử lại", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            displayName: profile?.displayName || '',
            description: profile?.description || '',
            avatarUrl: profile?.avatarUrl || currentUser?.photoURL || ''
        });
        setIsEditing(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Không có thông tin';
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h2>
                    <p className="text-sm text-gray-600 mt-1">Quản lý thông tin cá nhân và tài khoản</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/30"
                    >
                        <BiPencil size={18} />
                        <span>Chỉnh sửa</span>
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            <BiX size={18} />
                            <span>Hủy</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg shadow-green-500/30 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <BiSave size={18} />
                                    <span>Lưu thay đổi</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Avatar & Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <img
                                src={formData.avatarUrl || currentUser?.photoURL}
                                alt="Avatar"
                                className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                            />
                            {isEditing && (
                                <>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={isUploadingAvatar}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-2xl transition-all duration-300"
                                    >
                                        {isUploadingAvatar ? (
                                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <BiUpload className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-3xl"/>
                                        )}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        accept="image/*"
                                        disabled={isUploadingAvatar}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên hiển thị
                                        </label>
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nhập tên của bạn"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Giới thiệu bản thân
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Viết vài dòng về bản thân..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {formData.displayName || 'Chưa có tên'}
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        {formData.description || 'Chưa có mô tả'}
                                    </p>
                                    {profile?.slug && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                            <span>@{profile.slug}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaShieldAlt className="text-blue-600" />
                    Thông tin tài khoản
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FaEnvelope className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-base font-semibold text-gray-900">{currentUser?.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                            <BiCheck size={16} />
                            <span>Đã xác thực</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <FaUser className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">User ID</p>
                            <p className="text-base font-mono text-gray-900 text-sm">{currentUser?.uid}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-amber-100 p-3 rounded-lg">
                            <FaCalendar className="text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</p>
                            <p className="text-base font-semibold text-gray-900">
                                {formatDate(currentUser?.metadata?.creationTime)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <FaCalendar className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500">Đăng nhập lần cuối</p>
                            <p className="text-base font-semibold text-gray-900">
                                {formatDate(currentUser?.metadata?.lastSignInTime)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Linked Accounts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tài khoản đã liên kết</h3>
                <div className="space-y-3">
                    {currentUser?.providerData?.map((provider, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                {provider.providerId.includes('google') && (
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                )}
                                {provider.providerId.includes('github') && (
                                    <svg className="w-6 h-6" fill="#24292e" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    {provider.providerId.includes('google') && 'Google'}
                                    {provider.providerId.includes('github') && 'GitHub'}
                                </p>
                                <p className="text-xs text-gray-500">{provider.email}</p>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                <BiCheck size={14} />
                                <span>Đã kết nối</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}