import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { auth, doSignOut } from '../firebase';
import { linkWithCredential, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import Analytics from '../components/Analytics';
import UserProfile from '../components/UserProfile';
import Settings from '../components/Settings';
import AccountSettings from '../components/AccountSettings';
import Inbox from '../components/Inbox';
import ThemeToggle from '../components/ThemeToggle';
import { BiPencil, BiChevronDown, BiGridAlt } from 'react-icons/bi';
import { FaBolt, FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaSignOutAlt, FaUser, FaCog, FaChartLine, FaLink, FaInbox, FaUserShield } from 'react-icons/fa';
import { Tab, Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';


const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const config = { success: { icon: <FaCheckCircle className="w-5 h-5" />, bg: 'bg-white dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-100', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' }, error: { icon: <FaExclamationTriangle className="w-5 h-5" />, bg: 'bg-white dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-100', iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' }, info: { icon: <FaInfoCircle className="w-5 h-5" />, bg: 'bg-white dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-100', iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' } };
    const { icon, bg, text, iconBg } = config[type];
    return (
        <div className={`${bg} rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden toast-enter backdrop-blur-sm`}>
            <div className="flex items-center gap-4 p-4"><div className={`${iconBg} p-2.5 rounded-lg`}>{icon}</div><p className={`${text} font-medium flex-1 text-sm`}>{message}</p><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={onClose}></div>
                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full modal-enter">
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 px-6 pt-6 pb-4">
                        <div className="flex items-start"><div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"><FaSignOutAlt className="h-6 w-6" /></div><div className="ml-4 flex-1"><h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3><p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p></div></div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex gap-3 justify-end"><button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">{cancelText}</button><button onClick={onConfirm} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">{confirmText}</button></div>
                </div>
            </div>
        </div>
    );
};

const handleImageUpload = async (file) => {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
        return response.data.secure_url;
    } catch (error) { console.error("Lỗi tải ảnh lên Cloudinary:", error); return null; }
};

export default function HomePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingCredential, setPendingCredential] = useState(null);
    const [pendingEmail, setPendingEmail] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [authMessage, setAuthMessage] = useState("");
    const [toasts, setToasts] = useState([]);
    const profileMenuRef = useRef(null);

    const navItems = [
        { name: 'Quản lý', icon: <BiGridAlt className="h-5 w-5" /> },
        { name: 'Phân tích', icon: <FaChartLine className="h-5 w-5" /> },
        { name: 'Hồ sơ', icon: <FaUser className="h-5 w-5" /> },
        { name: 'Tùy chỉnh', icon: <FaCog className="h-5 w-5" /> },
        { name: 'Tài khoản', icon: <FaUserShield className="h-5 w-5" /> },
        { name: 'Hòm thư', icon: <FaInbox className="h-5 w-5" /> },
    ];

    const showToast = (message, type = 'success') => { const id = Math.random().toString(36).substring(2, 9); setToasts(prev => [...prev, { id, message, type }]); };
    const removeToast = (id) => { setToasts(prev => prev.filter(toast => toast.id !== id)); };

    useEffect(() => { const handleClickOutside = (event) => { if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) { setShowProfileMenu(false); } }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
    
    useEffect(() => {
        if (!currentUser) { sessionStorage.removeItem('welcome_toast_shown'); setProfile(null); setIsLoadingProfile(false); return; }
        const fetchInitialData = async () => { setIsLoadingProfile(true); try { const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/mine/${currentUser.uid}`); setProfile(response.data); if (!sessionStorage.getItem('welcome_toast_shown')) { showToast(`Xin chào, ${response.data.displayName || currentUser.displayName}!`, 'success'); sessionStorage.setItem('welcome_toast_shown', 'true'); } } catch (error) { if (error.response && error.response.status === 404) { const newProfile = { displayName: currentUser.displayName, avatarUrl: currentUser.photoURL, userId: currentUser.uid, slug: '', blocks: [] }; setProfile(newProfile); if (!sessionStorage.getItem('welcome_toast_shown')) { showToast(`Chào mừng bạn đến với BioLink`, 'success'); sessionStorage.setItem('welcome_toast_shown', 'true'); } } } finally { setIsLoadingProfile(false); } }
        const fetchUnreadCount = async () => { try { const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/unread-count/${currentUser.uid}`); setUnreadCount(res.data.unreadCount); } catch (error) { console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error); } }
        fetchInitialData(); fetchUnreadCount(); const interval = setInterval(fetchUnreadCount, 10000); return () => clearInterval(interval);
    }, [currentUser]);

    const handleProfileUpdate = (updatedProfile) => { setProfile(prev => ({...prev, ...updatedProfile})); };
    const handleTabChange = (index) => { setSelectedTab(index); if (index === 5 && unreadCount > 0) { setUnreadCount(0); axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/mark-as-read/${currentUser.uid}`).catch(err => console.error("Lỗi khi đánh dấu đã đọc:", err)); } }
    const handleSocialSignIn = async (signInMethod) => { setAuthMessage(""); try { await signInMethod(); } catch (error) { if (error.code === 'auth/account-exists-with-different-credential') { setPendingCredential(error.credential); const email = error.customData?.email || error.email; setPendingEmail(email); setShowLinkModal(true); } else { console.error("Lỗi đăng nhập:", error); showToast("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.", 'error'); setPendingCredential(null); } } };
    const handleLinkAccount = async (method) => { try { setShowLinkModal(false); const credentialToLink = pendingCredential; const emailToUse = pendingEmail; let result; if (method.includes('google.com')) { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ login_hint: emailToUse }); result = await signInWithPopup(auth, provider); } else if (method.includes('github.com')) { const provider = new GithubAuthProvider(); result = await signInWithPopup(auth, provider); } if (result && credentialToLink) { await linkWithCredential(result.user, credentialToLink); showToast("Đã liên kết tài khoản thành công", 'success'); } setPendingCredential(null); setPendingEmail(null); setAuthMessage(""); } catch (error) { console.error("Lỗi khi liên kết tài khoản:", error); showToast("Không thể liên kết tài khoản. Vui lòng thử lại.", 'error'); setShowLinkModal(false); setPendingCredential(null); setPendingEmail(null); } };
    const onFileChange = async (event) => { const file = event.target.files[0]; if (file && currentUser) { setIsUploading(true); showToast("Đang tải ảnh lên...", 'info'); const imageUrl = await handleImageUpload(file); if (imageUrl) { const avatarData = { userId: currentUser.uid, avatarUrl: imageUrl }; try { await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/avatar`, avatarData); setProfile(prev => ({ ...prev, avatarUrl: imageUrl })); showToast("Cập nhật ảnh đại diện thành công", 'success'); } catch(err) { showToast('Không thể cập nhật ảnh đại diện', 'error'); } } else { showToast('Không thể tải ảnh lên. Vui lòng thử lại', 'error'); } setIsUploading(false); } };
    const handleSignOut = async () => { try { await doSignOut(); showToast("Đăng xuất thành công. Hẹn gặp lại!", 'info'); setShowSignOutConfirm(false); setTimeout(() => navigate('/'), 1000); } catch (error) { console.error("Lỗi đăng xuất:", error); showToast("Có lỗi khi đăng xuất. Vui lòng thử lại", 'error'); } };
  
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md">{toasts.map(toast => (<Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)}/>))}</div>
            <ConfirmModal isOpen={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)} onConfirm={handleSignOut} title="Xác nhận đăng xuất" message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?" confirmText="Đăng xuất" cancelText="Hủy"/>
            {showLinkModal && ( <div className="fixed inset-0 z-50 overflow-y-auto"> <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"> <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowLinkModal(false)}></div> <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full modal-enter"> <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 px-6 pt-6 pb-4"> <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Liên kết tài khoản</h3> <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 mb-4"> <p className="text-sm text-gray-700 dark:text-gray-200"> Email <span className="font-semibold text-blue-600 dark:text-blue-400">{pendingEmail}</span> đã được liên kết với một phương thức đăng nhập khác. </p> </div> <p className="text-sm text-gray-600 dark:text-gray-300 mb-6"> Để tiếp tục, vui lòng đăng nhập bằng phương thức bạn đã sử dụng trước đó. Sau đó, các tài khoản sẽ được tự động liên kết. </p> <div className="space-y-3"> <button onClick={() => handleLinkAccount('google.com')} className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-800 dark:text-gray-100 font-semibold py-3.5 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md group"> <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> <span>Đăng nhập bằng Google</span> </button> <button onClick={() => handleLinkAccount('github.com')} className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-gray-900/30 hover:shadow-xl group"> <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> <span>Đăng nhập bằng GitHub</span> </button> </div> </div> <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4"> <button onClick={() => { setShowLinkModal(false); setPendingCredential(null); setPendingEmail(null); }} className="w-full py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"> Hủy bỏ </button> </div> </div> </div> </div> )}
            <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2.5 group"><div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300"><FaBolt className="text-white text-lg" /></div><span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">BioLink</span></Link>
                        {currentUser && (
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <div className="relative" ref={profileMenuRef}>
                                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"><img src={profile?.avatarUrl || currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"/><div className="hidden md:block text-left"><p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{profile?.displayName || currentUser.displayName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p></div><svg className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 dropdown-enter">
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="relative group"><img src={profile?.avatarUrl || currentUser.photoURL} alt="Avatar" className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-blue-500"/><button onClick={() => { fileInputRef.current.click(); setShowProfileMenu(false); }} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-xl transition-all duration-300">{isUploading ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : (<BiPencil className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg"/>)}</button></div>
                                                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{profile?.displayName || currentUser.displayName}</p><p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentUser.email}</p>{profile?.slug && (<p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">@{profile.slug}</p>)}</div>
                                                </div>
                                                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" disabled={isUploading}/>
                                            </div>
                                            <div className="py-2">
                                                <button onClick={() => { setShowProfileMenu(false); setSelectedTab(2); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"><div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors"><FaUser className="text-blue-600 dark:text-blue-400 text-sm" /></div><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Hồ sơ của tôi</p><p className="text-xs text-gray-500 dark:text-gray-400">Xem và chỉnh sửa thông tin</p></div></button>
                                                <button onClick={() => { setShowProfileMenu(false); if (profile?.slug) { window.open(`/${profile.slug}`, '_blank'); } else { showToast('Bạn chưa thiết lập slug cho trang của mình', 'info'); } }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"><div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors"><FaLink className="text-purple-600 dark:text-purple-400 text-sm" /></div><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Xem trang công khai</p><p className="text-xs text-gray-500 dark:text-gray-400">Mở trang BioLink của bạn</p></div></button>
                                                <button onClick={() => { setShowProfileMenu(false); setSelectedTab(1); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"><div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900 transition-colors"><FaChartLine className="text-green-600 dark:text-green-400 text-sm" /></div><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Phân tích & Thống kê</p><p className="text-xs text-gray-500 dark:text-gray-400">Xem số liệu truy cập</p></div></button>
                                                <button onClick={() => { setShowProfileMenu(false); setSelectedTab(3); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"><div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-500 transition-colors"><FaCog className="text-gray-600 dark:text-gray-300 text-sm" /></div><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tùy chỉnh</p><p className="text-xs text-gray-500 dark:text-gray-400">Giao diện, SEO, tích hợp</p></div></button>
                                                <button onClick={() => { setShowProfileMenu(false); setSelectedTab(4); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"><div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900 transition-colors"><FaUserShield className="text-orange-600 dark:text-orange-400 text-sm" /></div><div><p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tài khoản</p><p className="text-xs text-gray-500 dark:text-gray-400">Bảo mật và quản lý</p></div></button>
                                            </div>
                                            <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                                <button onClick={() => { setShowProfileMenu(false); setShowSignOutConfirm(true); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors text-left group rounded-lg"><div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900 transition-colors"><FaSignOutAlt className="text-red-600 dark:text-red-400 text-sm" /></div><div><p className="text-sm font-semibold text-red-600 dark:text-red-400">Đăng xuất</p><p className="text-xs text-red-500 dark:text-red-500/80">Thoát khỏi tài khoản</p></div></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                 {currentUser ? (
                     isLoadingProfile ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin"></div><p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải...</p></div>
                        </div>
                     ) : (
                         <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                            <div className="mb-8 max-w-md mx-auto">
                                <Menu as="div" className="relative inline-block text-left w-full">
                                    <div>
                                        <Menu.Button className="inline-flex w-full justify-between items-center gap-x-3 rounded-xl bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-md ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <div className="flex items-center gap-3">
                                                {navItems[selectedTab].icon}
                                                <span>{navItems[selectedTab].name}</span>
                                            </div>
                                            <BiChevronDown className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </Menu.Button>
                                    </div>

                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute left-0 right-0 z-10 mt-2 origin-top rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
                                            <div className="p-1">
                                                {navItems.map((item, index) => (
                                                    <Menu.Item key={item.name}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => handleTabChange(index)}
                                                                className={`${
                                                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                                } ${
                                                                    selectedTab === index ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                                                } group flex w-full items-center rounded-md px-3 py-2.5 text-sm gap-3`}
                                                            >
                                                                {item.icon}
                                                                <span>{item.name}</span>
                                                                {item.name === 'Hòm thư' && unreadCount > 0 && (
                                                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                            <Tab.Panels className="focus:outline-none">
                                <Tab.Panel><Dashboard profile={profile} onProfileUpdate={handleProfileUpdate} /></Tab.Panel>
                                <Tab.Panel><Analytics profile={profile} /></Tab.Panel>
                                <Tab.Panel><UserProfile profile={profile} currentUser={currentUser} onProfileUpdate={handleProfileUpdate} showToast={showToast}/></Tab.Panel>
                                <Tab.Panel><Settings currentUser={currentUser} profile={profile} onProfileUpdate={handleProfileUpdate} showToast={showToast}/></Tab.Panel>
                                <Tab.Panel><AccountSettings showToast={showToast} /></Tab.Panel>
                                <Tab.Panel><Inbox currentUser={currentUser} showToast={showToast} initialUnreadCount={unreadCount}/></Tab.Panel>
                            </Tab.Panels>
                         </Tab.Group>
                     )
                 ) : ( <LandingPage onSignIn={handleSocialSignIn} authMessage={authMessage} /> )}
            </main>
            <style>{` @keyframes toast-enter { from { transform: translateX(100%) scale(0.9); opacity: 0; } to { transform: translateX(0) scale(1); opacity: 1; } } @keyframes modal-enter { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } @keyframes dropdown-enter { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .toast-enter { animation: toast-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); } .modal-enter { animation: modal-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); } .dropdown-enter { animation: dropdown-enter 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); } `}</style>
        </div>
    );
}