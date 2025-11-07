import React, { useState, useEffect } from 'react';
import { BiShield, BiLock, BiBell, BiGlobe, BiTrash, BiLinkAlt, BiBarChartAlt2, BiPalette, BiReset, BiDownload, BiCloud } from 'react-icons/bi';
import { FaExclamationTriangle, FaGoogle, FaTiktok } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Settings({ currentUser, profile, onProfileUpdate, showToast }) {
    const [settings, setSettings] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        setSettings({
            emailNotifications: profile?.emailNotifications ?? true,
            analyticsEnabled: profile?.analyticsEnabled ?? true,
            publicProfile: profile?.publicProfile ?? true,
            showStats: profile?.showStats ?? false,
            allowIndexing: profile?.allowIndexing ?? true,
            sitemapUrl: profile?.sitemapUrl || '',
            customDomain: profile?.customDomain || '',
            googleTagManagerId: profile?.googleTagManagerId || '',
            tiktokPixelId: profile?.tiktokPixelId || '',
        });
    }, [profile]);

    const handleSettingChange = async (key, value) => {
        const originalValue = settings[key];
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        try {
            const payload = { userId: currentUser.uid, [key]: value };
            await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/settings`, payload);
            showToast('Đã cập nhật cài đặt', 'success');
            onProfileUpdate({ ...profile, ...newSettings });
        } catch (error) {
            console.error('Lỗi khi lưu cài đặt:', error);
            showToast('Không thể lưu cài đặt', 'error');
            setSettings(prev => ({ ...prev, [key]: originalValue }));
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveIntegrations = () => {
        handleSettingChange('googleTagManagerId', settings.googleTagManagerId);
        handleSettingChange('tiktokPixelId', settings.tiktokPixelId);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'XÓA TÀI KHOẢN') {
            showToast('Vui lòng nhập chính xác cụm từ xác nhận', 'error');
            return;
        }
        setIsDeleting(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/profiles/${currentUser.uid}`);
            showToast('Tài khoản đã được xóa thành công. Đang đăng xuất...', 'success');
            setTimeout(() => {
                 window.location.href = '/logout';
            }, 2000);
        } catch (error) {
            console.error("Lỗi xóa tài khoản:", error);
            showToast('Không thể xóa tài khoản. Vui lòng đăng nhập lại và thử lại', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResetAppearance = async () => {
        showToast('Chức năng đang được phát triển!', 'info');
    };

    const handleExportData = () => {
        showToast('Chức năng đang được phát triển!', 'info');
    };

    const SettingToggle = ({ title, description, enabled, onChange, icon: Icon }) => (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                    <Icon className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <div className="flex-1"><h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h4><p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{description}</p></div>
            </div>
            <button onClick={() => onChange(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </div>
    );
    
    const InputField = ({ name, label, placeholder, value, icon: Icon, description }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Icon/> {label}</label>
            <input type="text" name={name} value={value} onChange={handleInputChange} placeholder={placeholder} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cài đặt</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quản lý tài khoản, tích hợp và các tùy chọn nâng cao.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3"><BiShield className="text-blue-600 dark:text-blue-400" />Quyền riêng tư & Thông báo</h3>
                <div className="space-y-3">
                    <SettingToggle title="Hồ sơ công khai" description="Cho phép mọi người xem trang BioLink của bạn" enabled={settings.publicProfile} onChange={(v) => handleSettingChange('publicProfile', v)} icon={BiGlobe}/>
                    <SettingToggle title="Hiển thị thống kê" description="Hiển thị tổng lượt xem và nhấp trên trang công khai" enabled={settings.showStats} onChange={(v) => handleSettingChange('showStats', v)} icon={BiBarChartAlt2}/>
                    <SettingToggle title="Thu thập dữ liệu phân tích" description="Cho phép thu thập số liệu truy cập ẩn danh" enabled={settings.analyticsEnabled} onChange={(v) => handleSettingChange('analyticsEnabled', v)} icon={BiLock}/>
                    <SettingToggle title="Thông báo qua Email" description="Nhận cập nhật và thông báo quan trọng qua email" enabled={settings.emailNotifications} onChange={(v) => handleSettingChange('emailNotifications', v)} icon={BiBell}/>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3"><BiLinkAlt className="text-green-600 dark:text-green-400" />SEO & Tên miền</h3>
                <div className="space-y-4">
                    <SettingToggle title="Cho phép Google lập chỉ mục" description="Để trang của bạn xuất hiện trên kết quả tìm kiếm Google" enabled={settings.allowIndexing} onChange={(v) => handleSettingChange('allowIndexing', v)} icon={FaGoogle}/>
                    <InputField name="sitemapUrl" label="URL Sitemap" placeholder="https://your-website.com/sitemap.xml" value={settings.sitemapUrl} icon={BiCloud} description="Nếu bạn có sitemap, hãy dán vào đây để Google hiểu rõ hơn về trang của bạn."/>
                    <InputField name="customDomain" label="Tên miền tùy chỉnh (Nâng cao)" placeholder="links.yourdomain.com" value={settings.customDomain} icon={BiGlobe} description="Trỏ một tên miền phụ vào trang BioLink của bạn. Yêu cầu cấu hình CNAME."/>
                    <div className="text-right"><button onClick={() => { handleSettingChange('sitemapUrl', settings.sitemapUrl); handleSettingChange('customDomain', settings.customDomain); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Lưu</button></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-3"><BiBarChartAlt2 className="text-purple-600 dark:text-purple-400" />Tích hợp Marketing</h3>
                <div className="space-y-4">
                    <InputField name="googleTagManagerId" label="Google Tag Manager ID" placeholder="GTM-XXXXXX" value={settings.googleTagManagerId} icon={FaGoogle}/>
                    <InputField name="tiktokPixelId" label="TikTok Pixel ID" placeholder="C0D3EX4MPL3..." value={settings.tiktokPixelId} icon={FaTiktok}/>
                    <div className="text-right"><button onClick={handleSaveIntegrations} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Lưu Tích hợp</button></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-red-200 dark:border-red-500/50 p-6">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-3"><FaExclamationTriangle />Vùng nguy hiểm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex flex-col">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><BiDownload/> Xuất dữ liệu</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-4 flex-grow">Tải xuống tất cả dữ liệu phân tích của bạn dưới dạng tệp CSV.</p>
                        <button onClick={handleExportData} className="w-full mt-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Xuất file CSV</button>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex flex-col">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 flex items-center gap-2"><BiReset/> Đặt lại Giao diện</h4>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mb-4 flex-grow">Khôi phục tất cả cài đặt về nền, font chữ và nút về mặc định.</p>
                        <button onClick={handleResetAppearance} className="w-full mt-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Đặt lại</button>
                    </div>
                </div>
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">Xóa tài khoản vĩnh viễn</h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-4">Hành động này sẽ xóa vĩnh viễn tài khoản của bạn. <span className="font-semibold text-red-600 dark:text-red-400">Không thể hoàn tác!</span></p>
                    {!showDeleteConfirm ? (
                        <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"><BiTrash /><span>Xóa tài khoản của tôi</span></button>
                    ) : (
                        <div className="space-y-3 max-w-sm">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-2">Nhập <span className="font-bold text-red-600 dark:text-red-400">"XÓA TÀI KHOẢN"</span> để xác nhận:</label>
                                <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full px-3 py-2 border-2 border-red-300 dark:border-red-500 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" placeholder="XÓA TÀI KHOẢN"/>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Hủy</button>
                                <button onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== 'XÓA TÀI KHOẢN'} className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isDeleting ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Đang xóa...</span></div>) : ('Xác nhận xóa')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}