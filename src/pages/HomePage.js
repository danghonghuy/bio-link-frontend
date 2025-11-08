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
import { motion, AnimatePresence } from 'framer-motion';

// --- Components Con (Toast, Modal) không thay đổi, giữ nguyên ---

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const typeConfig = {
        success: { icon: <FaCheckCircle className="w-5 h-5" />, iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' },
        error: { icon: <FaExclamationTriangle className="w-5 h-5" />, iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' },
        info: { icon: <FaInfoCircle className="w-5 h-5" />, iconBg: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' }
    };

    const { icon, iconBg } = typeConfig[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm"
        >
            <div className="flex items-center gap-4 p-4">
                <div className={`${iconBg} p-2.5 rounded-lg`}>{icon}</div>
                <p className="text-gray-800 dark:text-gray-100 font-medium flex-1 text-sm">{message}</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </motion.div>
    );
};


const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm" onClick={onClose}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        >
                            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 px-6 pt-6 pb-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"><FaSignOutAlt className="h-6 w-6" /></div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex gap-3 justify-end">
                                <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                    {cancelText}
                                </button>
                                <button onClick={onConfirm} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-lg hover:from-rose-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};


const handleImageUpload = async (file) => {
    // Hàm này giữ nguyên
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


// === COMPONENT CHÍNH ĐÃ ĐƯỢC NÂNG CẤP ===
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
    const [authMessage, setAuthMessage] = useState("");
    const [toasts, setToasts] = useState([]);
    
    // Danh sách các mục menu điều hướng chính
    const navItems = [
        { name: 'Quản lý', icon: <BiGridAlt className="h-5 w-5" /> },
        { name: 'Phân tích', icon: <FaChartLine className="h-5 w-5" /> },
        { name: 'Hồ sơ', icon: <FaUser className="h-5 w-5" /> },
        { name: 'Tùy chỉnh', icon: <FaCog className="h-5 w-5" /> },
        { name: 'Tài khoản', icon: <FaUserShield className="h-5 w-5" /> },
        { name: 'Hòm thư', icon: <FaInbox className="h-5 w-5" /> },
    ];
    
    // Định nghĩa hiệu ứng chuyển động cho các Tab Panel
    const panelVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeInOut" } },
    };

    const showToast = (message, type = 'success') => { const id = Math.random().toString(36).substring(2, 9); setToasts(prev => [...prev, { id, message, type }]); };
    const removeToast = (id) => { setToasts(prev => prev.filter(toast => toast.id !== id)); };

    useEffect(() => {
        // Các logic trong useEffect được giữ nguyên
        if (!currentUser) { sessionStorage.removeItem('welcome_toast_shown'); setProfile(null); setIsLoadingProfile(false); return; }
        const fetchInitialData = async () => { setIsLoadingProfile(true); try { const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/mine/${currentUser.uid}`); setProfile(response.data); if (!sessionStorage.getItem('welcome_toast_shown')) { showToast(`Xin chào, ${response.data.displayName || currentUser.displayName}!`, 'success'); sessionStorage.setItem('welcome_toast_shown', 'true'); } } catch (error) { if (error.response && error.response.status === 404) { const newProfile = { displayName: currentUser.displayName, avatarUrl: currentUser.photoURL, userId: currentUser.uid, slug: '', blocks: [] }; setProfile(newProfile); if (!sessionStorage.getItem('welcome_toast_shown')) { showToast(`Chào mừng bạn đến với BioLink`, 'success'); sessionStorage.setItem('welcome_toast_shown', 'true'); } } } finally { setIsLoadingProfile(false); } }
        const fetchUnreadCount = async () => { try { const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/unread-count/${currentUser.uid}`); setUnreadCount(res.data.unreadCount); } catch (error) { console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error); } }
        fetchInitialData(); fetchUnreadCount(); const interval = setInterval(fetchUnreadCount, 10000); return () => clearInterval(interval);
    }, [currentUser]);

    // Các hàm xử lý sự kiện giữ nguyên
    const handleProfileUpdate = (updatedProfile) => { setProfile(prev => ({...prev, ...updatedProfile})); };
    const handleTabChange = (index) => { setSelectedTab(index); if (index === 5 && unreadCount > 0) { setUnreadCount(0); axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/mark-as-read/${currentUser.uid}`).catch(err => console.error("Lỗi khi đánh dấu đã đọc:", err)); } }
    const handleSocialSignIn = async (signInMethod) => { setAuthMessage(""); try { await signInMethod(); } catch (error) { if (error.code === 'auth/account-exists-with-different-credential') { setPendingCredential(error.credential); const email = error.customData?.email || error.email; setPendingEmail(email); setShowLinkModal(true); } else { console.error("Lỗi đăng nhập:", error); showToast("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.", 'error'); setPendingCredential(null); } } };
    const handleLinkAccount = async (method) => { try { setShowLinkModal(false); const credentialToLink = pendingCredential; const emailToUse = pendingEmail; let result; if (method.includes('google.com')) { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ login_hint: emailToUse }); result = await signInWithPopup(auth, provider); } else if (method.includes('github.com')) { const provider = new GithubAuthProvider(); result = await signInWithPopup(auth, provider); } if (result && credentialToLink) { await linkWithCredential(result.user, credentialToLink); showToast("Đã liên kết tài khoản thành công", 'success'); } setPendingCredential(null); setPendingEmail(null); setAuthMessage(""); } catch (error) { console.error("Lỗi khi liên kết tài khoản:", error); showToast("Không thể liên kết tài khoản. Vui lòng thử lại.", 'error'); setShowLinkModal(false); setPendingCredential(null); setPendingEmail(null); } };
    const onFileChange = async (event) => { const file = event.target.files[0]; if (file && currentUser) { setIsUploading(true); showToast("Đang tải ảnh lên...", 'info'); const imageUrl = await handleImageUpload(file); if (imageUrl) { const avatarData = { userId: currentUser.uid, avatarUrl: imageUrl }; try { await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/avatar`, avatarData); setProfile(prev => ({ ...prev, avatarUrl: imageUrl })); showToast("Cập nhật ảnh đại diện thành công", 'success'); } catch(err) { showToast('Không thể cập nhật ảnh đại diện', 'error'); } } else { showToast('Không thể tải ảnh lên. Vui lòng thử lại', 'error'); } setIsUploading(false); } };
    const handleSignOut = async () => { try { await doSignOut(); showToast("Đăng xuất thành công. Hẹn gặp lại!", 'info'); setShowSignOutConfirm(false); setTimeout(() => navigate('/'), 1000); } catch (error) { console.error("Lỗi đăng xuất:", error); showToast("Có lỗi khi đăng xuất. Vui lòng thử lại", 'error'); } };
  
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Vùng hiển thị Toast */}
            <div className="fixed top-6 right-6 z-50 space-y-3 max-w-md w-full">
                <AnimatePresence>
                    {toasts.map(toast => (<Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)}/>))}
                </AnimatePresence>
            </div>
            
            <ConfirmModal isOpen={showSignOutConfirm} onClose={() => setShowSignOutConfirm(false)} onConfirm={handleSignOut} title="Xác nhận đăng xuất" message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản của mình không?" confirmText="Đăng xuất" cancelText="Hủy"/>
            
            {/* Modal liên kết tài khoản (giữ nguyên) */}
            {showLinkModal && ( <div className="fixed inset-0 z-50 overflow-y-auto"> {/* ... code modal ... */} </div> )}

            {/* Header được nâng cấp với Profile Menu mới */}
            <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:scale-105">
                                <FaBolt className="text-white text-lg" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                BioLink
                            </span>
                        </Link>
                        {currentUser && (
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                
                                {/* === MENU PROFILE ĐÃ NÂNG CẤP === */}
                                <Menu as="div" className="relative">
                                    <Menu.Button className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <img src={profile?.avatarUrl || currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-200 dark:ring-gray-600"/>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">{profile?.displayName || currentUser.displayName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                                        </div>
                                        <BiChevronDown className="w-5 h-5 text-gray-400 transition-transform ui-open:rotate-180" />
                                    </Menu.Button>
                                    
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 focus:outline-none">
                                            {/* Header của dropdown */}
                                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-800/80">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="relative group">
                                                        <img src={profile?.avatarUrl || currentUser.photoURL} alt="Avatar" className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-200 dark:ring-blue-500"/>
                                                        <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-xl transition-all duration-300">
                                                            {isUploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <BiPencil className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg"/>}
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{profile?.displayName || currentUser.displayName}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{currentUser.email}</p>
                                                        {profile?.slug && <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">@{profile.slug}</p>}
                                                    </div>
                                                </div>
                                                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" disabled={isUploading}/>
                                            </div>

                                            {/* Các mục menu */}
                                            <div className="py-2">
                                                {[
                                                    { name: "Hồ sơ của tôi", desc: "Xem và chỉnh sửa thông tin", icon: FaUser, color: "blue", action: () => handleTabChange(2) },
                                                    { name: "Xem trang công khai", desc: "Mở trang BioLink của bạn", icon: FaLink, color: "purple", action: () => profile?.slug ? window.open(`/${profile.slug}`, '_blank') : showToast('Bạn chưa thiết lập slug!', 'info') },
                                                    { name: "Phân tích & Thống kê", desc: "Xem số liệu truy cập", icon: FaChartLine, color: "green", action: () => handleTabChange(1) },
                                                    { name: "Tùy chỉnh", desc: "Giao diện, SEO, tích hợp", icon: FaCog, color: "gray", action: () => handleTabChange(3) },
                                                    { name: "Tài khoản", desc: "Bảo mật và quản lý", icon: FaUserShield, color: "orange", action: () => handleTabChange(4) },
                                                ].map(item => (
                                                    <Menu.Item key={item.name}>
                                                        {({ active }) => (
                                                            <button onClick={item.action} className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                                                                <div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/50 group-hover:bg-${item.color}-200 dark:group-hover:bg-${item.color}-900 transition-colors`}>
                                                                    <item.icon className={`text-sm text-${item.color}-600 dark:text-${item.color}-400`} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                                                </div>
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>

                                            {/* Nút Đăng xuất */}
                                            <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                                <Menu.Item>
                                                     {({ active }) => (
                                                        <button onClick={() => setShowSignOutConfirm(true)} className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors rounded-lg ${active ? 'bg-red-50 dark:bg-red-900/40' : ''}`}>
                                                            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900 transition-colors">
                                                                <FaSignOutAlt className="text-red-600 dark:text-red-400 text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Đăng xuất</p>
                                                                <p className="text-xs text-red-500 dark:text-red-500/80">Thoát khỏi tài khoản</p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                 {currentUser ? (
                     isLoadingProfile ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải...</p>
                            </div>
                        </div>
                     ) : (
                         <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                            {/* Tab.List vẫn tồn tại để quản lý state, nhưng được ẩn đi */}
                            <Tab.List className="hidden">
                                {navItems.map(item => <Tab key={item.name}>{item.name}</Tab>)}
                            </Tab.List>

                            {/* === MENU DROPDOWN CHÍNH ĐÃ ĐƯỢC THAY THẾ === */}
                             <div className="mb-8 max-w-sm mx-auto">
                                <Menu as="div" className="relative text-left w-full">
                                    <div>
                                        <Menu.Button className="inline-flex justify-between w-full rounded-xl border border-gray-300/70 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-md shadow-gray-200/40 dark:shadow-black/20 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-gray-900 focus-visible:ring-blue-500 transition-all duration-300">
                                            <span className="flex items-center gap-3">
                                                {navItems[selectedTab].icon}
                                                {navItems[selectedTab].name}
                                            </span>
                                            <BiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                                        </Menu.Button>
                                    </div>
                                    <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-150"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="absolute left-0 right-0 mt-2 w-full origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border dark:border-gray-700 focus:outline-none p-2 z-10">
                                            {navItems.map((item, index) => (
                                                <Menu.Item key={item.name}>
                                                    {({ active }) => (
                                                        <button onClick={() => handleTabChange(index)} className={`${active || selectedTab === index ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors relative`}>
                                                            <div className="flex items-center gap-3">
                                                                {item.icon}
                                                                {item.name}
                                                            </div>
                                                            {item.name === 'Hòm thư' && unreadCount > 0 && (
                                                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                                                            )}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                             </div>

                            {/* Tab Panels với hiệu ứng chuyển động */}
                            <AnimatePresence mode="wait">
                                <motion.div key={selectedTab} variants={panelVariants} initial="hidden" animate="visible" exit="exit">
                                    <Tab.Panels className="focus:outline-none">
                                        <Tab.Panel><Dashboard profile={profile} onProfileUpdate={handleProfileUpdate} /></Tab.Panel>
                                        <Tab.Panel><Analytics profile={profile} /></Tab.Panel>
                                        <Tab.Panel><UserProfile profile={profile} currentUser={currentUser} onProfileUpdate={handleProfileUpdate} showToast={showToast}/></Tab.Panel>
                                        <Tab.Panel><Settings currentUser={currentUser} profile={profile} onProfileUpdate={handleProfileUpdate} showToast={showToast}/></Tab.Panel>
                                        <Tab.Panel><AccountSettings showToast={showToast} /></Tab.Panel>
                                        <Tab.Panel><Inbox currentUser={currentUser} showToast={showToast} initialUnreadCount={unreadCount}/></Tab.Panel>
                                    </Tab.Panels>
                                </motion.div>
                            </AnimatePresence>
                         </Tab.Group>
                     )
                 ) : ( <LandingPage onSignIn={handleSocialSignIn} authMessage={authMessage} /> )}
            </main>
        </div>
    );
}