import React, { useState } from 'react';
import { BiShield, BiLock, BiBell, BiGlobe, BiTrash, BiSave } from 'react-icons/bi';
import { FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

export default function Settings({ currentUser, profile, onProfileUpdate, showToast }) {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        analyticsEnabled: true,
        publicProfile: true,
        showStats: false
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSettingChange = async (key) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        
        // Save to backend
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/settings`, {
                userId: currentUser.uid,
                settings: newSettings
            });
            showToast('Đã cập nhật cài đặt', 'success');
            
            // Update profile with new settings
            onProfileUpdate({ ...profile, ...newSettings });
        } catch (error) {
            console.error('Lỗi khi lưu cài đặt:', error);
            showToast('Không thể lưu cài đặt', 'error');
            // Revert settings on error
            setSettings(prev => ({ ...prev, [key]: !newSettings[key] }));
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'XÓA TÀI KHOẢN') {
            showToast('Vui lòng nhập chính xác cụm từ xác nhận', 'error');
            return;
        }

        setIsDeleting(true);
        try {
            // Delete profile and all related data
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/profiles/${currentUser.uid}`);
            
            // Delete user account from Firebase
            await currentUser.delete();
            
            showToast('Tài khoản đã được xóa thành công', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
            showToast('Không thể xóa tài khoản. Vui lòng đăng nhập lại và thử lại', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const SettingToggle = ({ title, description, enabled, onChange, icon: Icon }) => (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Icon className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
                <p className="text-sm text-gray-600 mt-1">Tùy chỉnh trải nghiệm của bạn</p>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BiShield className="text-blue-600" />
                    Quyền riêng tư & Bảo mật
                </h3>
                <div className="space-y-3">
                    <SettingToggle
                        title="Hồ sơ công khai"
                        description="Cho phép mọi người xem trang BioLink của bạn"
                        enabled={settings.publicProfile}
                        onChange={() => handleSettingChange('publicProfile')}
                        icon={BiGlobe}
                    />
                    <SettingToggle
                        title="Hiển thị thống kê"
                        description="Hiển thị số lượt click trên trang công khai"
                        enabled={settings.showStats}
                        onChange={() => handleSettingChange('showStats')}
                        icon={BiShield}
                    />
                    <SettingToggle
                        title="Thu thập dữ liệu phân tích"
                        description="Cho phép thu thập số liệu truy cập để cải thiện dịch vụ"
                        enabled={settings.analyticsEnabled}
                        onChange={() => handleSettingChange('analyticsEnabled')}
                        icon={BiLock}
                    />
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BiBell className="text-blue-600" />
                    Thông báo
                </h3>
                <div className="space-y-3">
                    <SettingToggle
                        title="Thông báo qua Email"
                        description="Nhận cập nhật và thông báo quan trọng qua email"
                        enabled={settings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                        icon={BiBell}
                    />
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BiLock className="text-blue-600" />
                    Quản lý tài khoản
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                            <BiSave className="text-blue-600" />
                            Xuất dữ liệu
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                            Tải xuống một bản sao tất cả dữ liệu của bạn bao gồm hồ sơ, khối liên kết và thống kê
                        </p>
                        <button 
                            onClick={() => showToast('Tính năng đang được phát triển', 'info')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Xuất dữ liệu
                        </button>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                            <BiLock className="text-amber-600" />
                            Đổi mật khẩu
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                            Cập nhật mật khẩu của bạn để bảo vệ tài khoản tốt hơn
                        </p>
                        <button 
                            onClick={() => showToast('Tính năng đang được phát triển', 'info')}
                            className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6">
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle />
                    Vùng nguy hiểm
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Xóa tài khoản</h4>
                    <p className="text-xs text-gray-700 mb-4">
                        Hành động này sẽ xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu liên quan. 
                        <span className="font-semibold text-red-600"> Không thể hoàn tác!</span>
                    </p>
                    
                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <BiTrash />
                            <span>Xóa tài khoản</span>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Nhập <span className="font-bold text-red-600">"XÓA TÀI KHOẢN"</span> để xác nhận:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    placeholder="XÓA TÀI KHOẢN"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeleteConfirmText('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmText !== 'XÓA TÀI KHOẢN'}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xóa...</span>
                                        </div>
                                    ) : (
                                        'Xác nhận xóa'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* App Version */}
            <div className="text-center text-xs text-gray-500">
                <p>BioLink v1.0.0</p>
                <p className="mt-1">© 2025 BioLink. Made with ❤️ in Vietnam</p>
            </div>
        </div>
    );
}