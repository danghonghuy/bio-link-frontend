import React, { useState } from 'react';
import axios from 'axios';
import { BiEnvelope, BiKey, BiTrash, BiSave, BiErrorCircle } from 'react-icons/bi';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ReauthModal = ({ isOpen, onClose, onConfirm, isConfirming }) => {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(password);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Xác thực lại</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Để thực hiện hành động này, vui lòng nhập lại mật khẩu của bạn.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Mật khẩu"
                        required
                        autoFocus
                    />
                    <div className="flex gap-2 mt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Hủy</button>
                        <button type="submit" disabled={isConfirming} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {isConfirming ? 'Đang xác thực...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function AccountSettings({ showToast }) {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState(currentUser.email);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(null);
    const [reauthModal, setReauthModal] = useState({ isOpen: false, action: null });
    const [isConfirming, setIsConfirming] = useState(false);

    const reauthenticate = async (password) => {
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(currentUser, credential);
            return true;
        } catch (error) {
            if (error.code === 'auth/wrong-password') {
                showToast('Mật khẩu không chính xác.', 'error');
            } else {
                showToast('Lỗi xác thực. Vui lòng thử lại.', 'error');
            }
            return false;
        }
    };
    
    const handleReauthConfirm = async (password) => {
        setIsConfirming(true);
        const isAuthenticated = await reauthenticate(password);
        setIsConfirming(false);

        if (isAuthenticated) {
            const action = reauthModal.action;
            setReauthModal({ isOpen: false, action: null });
            if (action) await action(password);
        }
    };
    
    const triggerAction = (actionCallback) => {
        const passwordProvider = currentUser.providerData.find(p => p.providerId === 'password');
        if (!passwordProvider) {
            showToast('Chức năng này chỉ dành cho tài khoản đăng ký bằng email/mật khẩu.', 'info');
            return;
        }
        setReauthModal({ isOpen: true, action: actionCallback });
    };

    const handleChangeEmail = async (password) => {
        setIsSaving('email');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/account/change-email`, {
                userId: currentUser.uid,
                newEmail: email,
                password: password 
            });
            showToast('Email đã được cập nhật. Vui lòng đăng nhập lại.', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Không thể đổi email.', 'error');
        } finally {
            setIsSaving(null);
        }
    };
    
    const handleChangePassword = async (currentPassword) => {
        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu mới không khớp!', 'error'); return;
        }
        if (newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error'); return;
        }
        setIsSaving('password');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/account/change-password`, {
                userId: currentUser.uid,
                currentPassword: currentPassword,
                newPassword: newPassword,
            });
            setNewPassword('');
            setConfirmPassword('');
            showToast('Đổi mật khẩu thành công!', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Không thể đổi mật khẩu.', 'error');
        } finally {
            setIsSaving(null);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <ReauthModal isOpen={reauthModal.isOpen} onClose={() => setReauthModal({ isOpen: false, action: null })} onConfirm={handleReauthConfirm} isConfirming={isConfirming} />

            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cài đặt Tài khoản</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quản lý email, mật khẩu và bảo mật tài khoản.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3"><BiEnvelope /> Thay đổi Email</h3>
                <form onSubmit={(e) => { e.preventDefault(); triggerAction(handleChangeEmail); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSaving === 'email'} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {isSaving === 'email' ? 'Đang lưu...' : 'Lưu Email'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3"><BiKey /> Thay đổi Mật khẩu</h3>
                <form onSubmit={(e) => { e.preventDefault(); triggerAction(handleChangePassword); }} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Xác nhận mật khẩu mới</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSaving === 'password'} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                           {isSaving === 'password' ? 'Đang lưu...' : 'Đổi Mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}