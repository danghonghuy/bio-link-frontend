import React, { useState, useEffect, Fragment, useRef, useMemo } from 'react';
import axios from 'axios';
import { Menu, Transition, Tab, Switch } from '@headlessui/react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { BiPencil, BiTrash, BiMenu, BiBarChart, BiCopy, BiChevronDown, BiPalette, BiCog, BiCheck, BiUpload, BiX, BiImage, BiCoffeeTogo, BiMoney, BiLinkAlt, BiShareAlt, BiQrScan, BiPlus, BiSearch, BiListUl, BiGridAlt, BiShow, BiHide } from 'react-icons/bi';
import { FaLink, FaYoutube, FaHeading, FaSpotify, FaSoundcloud, FaTiktok, FaFacebook, FaInstagram, FaGithub, FaTwitter, FaTelegramPlane, FaDiscord, FaWhatsapp, FaPatreon, FaPaypal, FaCheckCircle, FaRegCircle, FaQuestionCircle } from 'react-icons/fa';
import { SiZalo, SiLeagueoflegends, SiKofi } from 'react-icons/si';
import { IoGameController } from 'react-icons/io5';
import { QRCodeSVG } from 'qrcode.react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import clsx from 'clsx';

import EditBlockModal from './EditBlockModal';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { getIconForUrl } from '../utils/icons';
import MobilePreview from './MobilePreview';

const fadeInUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } };
const staggerContainer = { animate: { transition: { staggerChildren: 0.07 } } };

const Card = ({ children, className = '', ...props }) => (
    <motion.div variants={fadeInUp} className={clsx('bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700', className)} {...props}>
        {children}
    </motion.div>
);

const FormItem = ({ label, children, description }) => (
    <motion.div variants={fadeInUp}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
        {children}
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{description}</p>}
    </motion.div>
);

const StyledInput = React.forwardRef((props, ref) => (
    <input ref={ref} {...props} className="block w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" />
));

const StyledTextarea = React.forwardRef((props, ref) => (
    <textarea ref={ref} {...props} rows={3} className="block w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all" />
));

function SortableItem({ id, block, stats, onEdit, onDelete, onToggleStatus, isSelected, onSelect, layout }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition: transition || 'transform 250ms ease-in-out', zIndex: isDragging ? 10 : 'auto' };
    const data = JSON.parse(block.data);
    const clickCount = stats[id] || 0;
    let icon, title, subtitle;

    switch (block.type) {
        case 'youtube': icon = <FaYoutube className="text-red-500" />; title = data.title || "Video YouTube"; subtitle = data.url; break;
        case 'header': icon = <FaHeading className="text-slate-700 dark:text-slate-300" />; title = data.text; subtitle = "Tiêu đề phân cách"; break;
        case 'image': icon = <BiImage className="text-purple-500" />; title = data.title || "Hình ảnh"; subtitle = 'Một hình ảnh tùy chỉnh'; break;
        case 'faq': icon = <FaQuestionCircle className="text-blue-500" />; title = data.title || "Hỏi-Đáp (FAQ)"; subtitle = `${data.items?.length || 0} câu hỏi`; break;
        case 'spotify': icon = <FaSpotify className="text-green-500" />; title = data.title || "Nhạc Spotify"; subtitle = data.url; break;
        case 'soundcloud': icon = <FaSoundcloud className="text-orange-500" />; title = data.title || "Nhạc SoundCloud"; subtitle = data.url; break;
        case 'tiktok': icon = <FaTiktok className="text-black dark:text-white" />; title = data.title || "Video TikTok"; subtitle = data.url; break;
        default: icon = getIconForUrl(data.url); title = data.title; subtitle = data.url; break;
    }

    const itemClasses = clsx(
        'relative flex items-center bg-white dark:bg-slate-800/80 rounded-xl border transition-all duration-300 group',
        {
            'shadow-2xl scale-105 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900': isDragging,
            'hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600': !isDragging,
            'opacity-50 dark:bg-slate-800/40 brightness-90': !block.isEnabled,
            'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20': isSelected,
            'border-slate-200 dark:border-slate-700': !isSelected,
            'flex-col p-4 text-center': layout === 'grid',
            'p-3': layout === 'list'
        }
    );

    return (
        <motion.div ref={setNodeRef} style={style} variants={fadeInUp} layoutId={id} className={itemClasses}>
            <div className="absolute top-2.5 left-2.5 z-10">
                <input type="checkbox" checked={isSelected} onChange={() => onSelect(id)} className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-800" />
            </div>
            <div className={clsx('flex items-center', { 'flex-col': layout === 'grid' })}>
                <button {...attributes} {...listeners} className={clsx('cursor-grab p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500', { 'mb-2': layout === 'grid', 'ml-8': layout === 'list' })}>
                    <BiMenu size={22} />
                </button>
                <div className="text-3xl text-slate-500 dark:text-slate-400 w-10 h-10 flex items-center justify-center flex-shrink-0">{icon}</div>
            </div>
            <div className={clsx('flex-grow min-w-0', { 'text-left mx-3': layout === 'list', 'mt-3': layout === 'grid' })}>
                <p className="font-semibold text-slate-800 dark:text-slate-100 break-words truncate">{title || 'Chưa có tiêu đề'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{subtitle || 'URL không hợp lệ'}</p>
            </div>
            <div className={clsx('flex items-center flex-shrink-0', { 'flex-col mt-3 space-y-2': layout === 'grid', 'ml-4 space-x-1': layout === 'list' })}>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm hidden sm:flex">
                    <BiBarChart className="mr-1.5" /><span className="font-mono">{clickCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Switch checked={block.isEnabled} onChange={() => onToggleStatus(block.id, !block.isEnabled)} className={clsx('relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800', { 'bg-blue-600': block.isEnabled, 'bg-slate-300 dark:bg-slate-600': !block.isEnabled })}>
                        <span className={clsx('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', { 'translate-x-6': block.isEnabled, 'translate-x-1': !block.isEnabled })} />
                    </Switch>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(block)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><BiPencil size={20} /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(block.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><BiTrash size={20} /></motion.button>
                </div>
            </div>
        </motion.div>
    );
}

const SkeletonLoader = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 animate-pulse flex items-center space-x-4">
                <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
                    <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
        ))}
    </div>
);

const QuickStats = ({ blocks, stats }) => {
    const totalClicks = useMemo(() => Object.values(stats).reduce((sum, count) => sum + count, 0), [stats]);
    const topBlock = useMemo(() => {
        if (blocks.length === 0 || Object.keys(stats).length === 0) return null;
        const topBlockId = Object.entries(stats).sort(([, a], [, b]) => b - a)[0][0];
        return blocks.find(b => b.id === topBlockId);
    }, [blocks, stats]);

    return (
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng số khối</h3>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{blocks.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Tổng lượt click</h3>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{totalClicks}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Hiệu quả nhất</h3>
                {topBlock ? <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400 truncate">{JSON.parse(topBlock.data).title || 'Khối không tên'}</p> : <p className="mt-1 text-lg text-slate-400">Chưa có dữ liệu</p>}
            </div>
        </motion.div>
    );
};

const backgroundOptions = [{ name: 'Mặc định', value: 'dynamic-default-bg', preview: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)' }, { name: 'Synthwave', value: 'dynamic-vaporwave-bg', preview: 'linear-gradient(-45deg, #ff71ce, #01cdfe, #05ffa1, #b967ff)' }, { name: 'Cánh Hồng', value: 'dynamic-rose-petal-bg', preview: 'linear-gradient(-45deg, #f8cdda, #ea86b6, #e43a84, #f8cdda)' }, { name: 'Kẹo Ngọt', value: 'dynamic-candy-bg', preview: 'linear-gradient(-45deg, #ffafbd, #ffc3a0, #f6e58d, #ffafbd)' }, { name: 'Bình Minh', value: 'dynamic-sunrise-bg', preview: 'linear-gradient(-45deg, #ff6b6b, #feca57, #ff9f43, #ff6b6b)' }, { name: 'Cyberpunk', value: 'dynamic-cyber-bg', preview: 'linear-gradient(-45deg, #00f260, #0575e6, #4f00bc, #000000)' }, { name: 'Biển Sâu', value: 'dynamic-deepsea-bg', preview: 'linear-gradient(-45deg, #005c97, #363795, #003973, #005c97)' }, { name: 'Than Chì', value: 'dynamic-charcoal-bg', preview: 'linear-gradient(-45deg, #1e1e1e, #3e3e3e, #1e1e1e, #000000)' }, { name: 'Hoàng Hôn', value: 'linear-gradient(to right, #ff7e5f, #feb47b)', preview: 'linear-gradient(to right, #ff7e5f, #feb47b)' }, { name: 'Đại Dương', value: 'linear-gradient(to right, #00c6ff, #0072ff)', preview: 'linear-gradient(to right, #00c6ff, #0072ff)' }, { name: 'Tinh Vân', value: 'linear-gradient(to right, #8e2de2, #4a00e0)', preview: 'linear-gradient(to right, #8e2de2, #4a00e0)' }, { name: 'Xám Tối', value: 'linear-gradient(to right, #434343, #000000)', preview: 'linear-gradient(to right, #434343, #000000)' },];
const buttonStyleOptions = [{ name: 'Đầy', value: 'fill' }, { name: 'Viền', value: 'outline' }, { name: 'Đổ bóng', value: 'hard-shadow' }];
const buttonShapeOptions = [{ name: 'Bo góc', value: 'rounded-xl' }, { name: 'Mềm mại', value: 'rounded-full' }, { name: 'Vuông vức', value: 'rounded-none' }];
const fontOptions = [{ name: 'Mặc định', value: 'font-inter' }, { name: 'Roboto', value: 'font-roboto' }, { name: 'Source Code', value: 'font-source-code-pro' }, { name: 'Montserrat', value: 'font-montserrat' }, { name: 'Lato', value: 'font-lato' }, { name: 'Oswald', value: 'font-oswald' }, { name: 'Raleway', value: 'font-raleway' }];
const socialLinks = [{ type: 'link', label: 'Facebook', icon: <FaFacebook className="mr-3 h-5 w-5" />, placeholder: 'https://facebook.com/ten-cua-ban' }, { type: 'link', label: 'Instagram', icon: <FaInstagram className="mr-3 h-5 w-5" />, placeholder: 'https://instagram.com/ten-cua-ban' }, { type: 'link', label: 'X / Twitter', icon: <FaTwitter className="mr-3 h-5 w-5" />, placeholder: 'https://twitter.com/ten-handle' }, { type: 'link', label: 'GitHub', icon: <FaGithub className="mr-3 h-5 w-5" />, placeholder: 'https://github.com/ten-cua-ban' }, { type: 'link', label: 'Telegram', icon: <FaTelegramPlane className="mr-3 h-5 w-5" />, placeholder: 'username (không cần @)', prefix: 'https://t.me/' }, { type: 'link', label: 'Zalo', icon: <SiZalo className="mr-3 h-5 w-5" />, placeholder: 'Số điện thoại của bạn', prefix: 'https://zalo.me/' }, { type: 'link', label: 'WhatsApp', icon: <FaWhatsapp className="mr-3 h-5 w-5" />, placeholder: 'Số điện thoại (kèm mã quốc gia)', prefix: 'https://wa.me/' }, { type: 'link', label: 'Discord', icon: <FaDiscord className="mr-3 h-5 w-5" />, placeholder: 'Link mời server Discord', prefix: 'https://discord.gg/' }, { type: 'link', label: 'LMHT / Riot', icon: <SiLeagueoflegends className="mr-3 h-5 w-5" />, placeholder: 'https://www.leagueoflegends.com/' }, { type: 'link', label: 'Game (Hoyoverse)', icon: <IoGameController className="mr-3 h-5 w-5" />, placeholder: 'Link profile Hoyolab/Game' }, { type: 'link', label: 'Game khác', icon: <IoGameController className="mr-3 h-5 w-5" />, placeholder: 'Dán link profile game của bạn' }, { type: 'link', label: 'Link tùy chỉnh', icon: <FaLink className="mr-3 h-5 w-5" />, placeholder: 'https://your-website.com' },];
const monetizationLinks = [{ type: 'link', label: 'PayPal', icon: <FaPaypal className="mr-3 h-5 w-5 text-blue-800" />, placeholder: 'https://paypal.me/your-username' }, { type: 'link', label: 'Buy Me a Coffee', icon: <BiCoffeeTogo className="mr-3 h-5 w-5 text-yellow-500" />, placeholder: 'https://www.buymeacoffee.com/yourname' }, { type: 'link', label: 'Ko-fi', icon: <SiKofi className="mr-3 h-5 w-5 text-blue-500" />, placeholder: 'https://ko-fi.com/yourname' }, { type: 'link', label: 'Patreon', icon: <FaPatreon className="mr-3 h-5 w-5 text-red-500" />, placeholder: 'https://www.patreon.com/yourname' }, { type: 'link', label: 'Ngân hàng/Momo', icon: <BiMoney className="mr-3 h-5 w-5 text-green-600" />, placeholder: 'Số tài khoản, hoặc link QR' },];
const embedContent = [{ type: 'header', label: 'Tiêu đề', icon: <FaHeading className="mr-3 h-5 w-5" /> }, { type: 'image', label: 'Hình ảnh', icon: <BiImage className="mr-3 h-5 w-5" /> }, { type: 'faq', label: 'Hỏi-Đáp (FAQ)', icon: <FaQuestionCircle className="mr-3 h-5 w-5" /> }, { type: 'youtube', label: 'Video YouTube', icon: <FaYoutube className="mr-3 h-5 w-5" /> }, { type: 'tiktok', label: 'Video TikTok', icon: <FaTiktok className="mr-3 h-5 w-5" /> }, { type: 'spotify', label: 'Nhạc Spotify', icon: <FaSpotify className="mr-3 h-5 w-5" /> }, { type: 'soundcloud', label: 'Nhạc SoundCloud', icon: <FaSoundcloud className="mr-3 h-5 w-5" /> },];

export default function Dashboard({ profile: initialProfile, onProfileUpdate }) {
    const { currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [blocks, setBlocks] = useState([]);
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [layout, setLayout] = useState('list');
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [settings, setSettings] = useState({});
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [modalInfo, setModalInfo] = useState({ type: 'link', label: 'Liên kết' });
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingBg, setIsUploadingBg] = useState(false);
    const [isUploadingSocial, setIsUploadingSocial] = useState(false);
    const bgFileInputRef = React.useRef(null);
    const socialImgFileInputRef = React.useRef(null);
    const qrCodeRef = useRef(null);
    const bioLink = `${window.location.origin}/${settings.slug || ''}`;
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => {
        if (initialProfile) {
            setBlocks(initialProfile.blocks?.map(b => ({ ...b, isEnabled: b.isEnabled !== false })) || []);
            setSettings({
                displayName: initialProfile?.displayName || '',
                description: initialProfile?.description || '',
                slug: initialProfile?.slug || '',
                background: initialProfile?.background || 'dynamic-default-bg',
                backgroundImageOpacity: initialProfile?.backgroundImageOpacity ?? 50,
                buttonStyle: initialProfile?.buttonStyle || 'fill',
                buttonShape: initialProfile?.buttonShape || 'rounded-xl',
                fontColor: initialProfile?.fontColor || '#FFFFFF',
                font: initialProfile?.font || 'font-inter',
                seoTitle: initialProfile?.seoTitle || '',
                seoDescription: initialProfile?.seoDescription || '',
                socialImage: initialProfile?.socialImage || '',
                googleAnalyticsId: initialProfile?.googleAnalyticsId || '',
                facebookPixelId: initialProfile?.facebookPixelId || ''
            });
            if (currentUser?.uid) {
                axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/stats/${currentUser.uid}`)
                    .then(response => setStats(response.data))
                    .catch(err => console.error("Không thể tải thống kê:", err))
                    .finally(() => setTimeout(() => setIsLoading(false), 500));
            } else {
                setIsLoading(false);
            }
        }
    }, [initialProfile, currentUser]);

    const filteredBlocks = useMemo(() => {
        if (!searchTerm) return blocks;
        return blocks.filter(block => {
            try {
                const data = JSON.parse(block.data);
                const title = data.title || data.text || '';
                return title.toLowerCase().includes(searchTerm.toLowerCase());
            } catch { return false; }
        });
    }, [blocks, searchTerm]);

    const handleImageUpload = async (file) => {
        const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        try {
            const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
            return response.data.secure_url;
        } catch (error) { console.error("Lỗi tải ảnh lên Cloudinary:", error); toast.error("Tải ảnh lên thất bại."); return null; }
    };

    const handleFileUpload = async (file, setterFn) => { const imageUrl = await handleImageUpload(file); if (imageUrl) { setterFn(imageUrl); } };
    const onSocialImageChange = async (event) => { const file = event.target.files[0]; if (!file) return; setIsUploadingSocial(true); await handleFileUpload(file, (url) => setSettings(prev => ({ ...prev, socialImage: url }))); setIsUploadingSocial(false); };
    const onBgImageChange = async (event) => { const file = event.target.files[0]; if (!file) return; setIsUploadingBg(true); await handleFileUpload(file, (url) => setSettings(prev => ({ ...prev, background: url }))); setIsUploadingBg(false); };
    const handleSettingsChange = (e) => { const { name, value } = e.target; if (name === 'slug') { const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setSettings(prev => ({ ...prev, [name]: sanitizedSlug })); } else { setSettings(prev => ({ ...prev, [name]: value })); } };
    const handleProfileSave = async () => { if (!settings.slug || settings.slug.trim() === '') { toast.error("URL tùy chỉnh không được để trống."); return; } setIsSavingProfile(true); try { const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, { ...settings, userId: currentUser.uid }); onProfileUpdate(response.data); toast.success("Đã lưu cài đặt thành công!"); } catch (err) { const errorMessage = err.response?.data?.message || "Lưu cài đặt thất bại."; toast.error(errorMessage); } finally { setIsSavingProfile(false); } };
    
    const handleCopyLink = () => { navigator.clipboard.writeText(bioLink); toast.success("Đã sao chép link!"); };
    const handleDownloadQr = () => { const svgElement = qrCodeRef.current.querySelector('svg'); const svgData = new XMLSerializer().serializeToString(svgElement); const canvas = document.createElement("canvas"); const img = new Image(); img.onload = () => { canvas.width = img.width * 2; canvas.height = img.height * 2; const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); const pngUrl = canvas.toDataURL("image/png"); let downloadLink = document.createElement("a"); downloadLink.href = pngUrl; downloadLink.download = `${settings.slug || 'biolink'}-qr.png`; document.body.appendChild(downloadLink); downloadLink.click(); document.body.removeChild(downloadLink); }; img.src = "data:image/svg+xml;base64," + btoa(svgData); };
    
    const handleDragEnd = (event) => { const { active, over } = event; if (over && active.id !== over.id) { setBlocks((items) => { const oldIndex = items.findIndex(item => item.id === active.id); const newIndex = items.findIndex(item => item.id === over.id); const newOrder = arrayMove(items, oldIndex, newIndex); const orderedIds = newOrder.map(b => b.id); axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/reorder/${currentUser.uid}`, orderedIds).catch(err => toast.error("Lỗi khi sắp xếp.")); return newOrder; }); } };
    
    const handleOpenModalToAdd = (item) => { setEditingBlock(null); setModalInfo(item); setIsModalOpen(true); };
    const handleOpenModalToEdit = (block) => { setEditingBlock(block); const allLinks = [...socialLinks, ...monetizationLinks]; const label = embedContent.find(item => item.type === block.type)?.label || allLinks.find(item => { try { return item.placeholder.includes(new URL(JSON.parse(block.data)?.url).hostname); } catch { return false; } })?.label || 'Link tùy chỉnh'; setModalInfo({ type: block.type, label }); setIsModalOpen(true); };
    const handleDeleteBlock = (blockId) => { setConfirmState({ isOpen: true, title: "Xác nhận xóa khối", message: "Bạn có chắc chắn muốn xóa khối này không? Hành động này không thể hoàn tác.", onConfirm: async () => { try { await axios.delete(`${process.env.REACT_APP_API_URL}/api/blocks/${blockId}`); setBlocks(prev => prev.filter(b => b.id !== blockId)); toast.success("Đã xóa khối."); } catch (err) { toast.error("Xóa khối thất bại."); } } }); };
    const handleSaveBlock = async (rawData) => { const blockType = editingBlock ? editingBlock.type : modalInfo.type; let finalData = { ...rawData }; const allLinks = [...socialLinks, ...monetizationLinks]; const linkInfo = allLinks.find(item => item.label === modalInfo.label); if (blockType === 'link' && linkInfo && linkInfo.prefix && finalData.url && !finalData.url.startsWith('http')) { finalData.url = linkInfo.prefix + finalData.url; } const blockData = { type: blockType, data: JSON.stringify(finalData), isEnabled: editingBlock ? editingBlock.isEnabled : true }; try { let response; if (editingBlock) { response = await axios.put(`${process.env.REACT_APP_API_URL}/api/blocks/${editingBlock.id}`, blockData); setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response.data : b)); } else { response = await axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/${currentUser.uid}`, blockData); setBlocks(prev => [...prev, response.data]); } onProfileUpdate({ blocks: [...blocks.filter(b => b.id !== response.data.id), response.data] }); toast.success("Đã lưu khối thành công!"); } catch (err) { toast.error("Lưu khối thất bại."); } setEditingBlock(null); };
    
    const handleToggleStatus = async (blockId, isEnabled) => { const originalBlocks = [...blocks]; setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, isEnabled } : b)); try { await axios.patch(`${process.env.REACT_APP_API_URL}/api/blocks/${blockId}/status`, { isEnabled }); toast.success(`Đã ${isEnabled ? 'bật' : 'tắt'} khối.`); } catch (error) { toast.error("Cập nhật trạng thái thất bại."); setBlocks(originalBlocks); } };
    const handleSelectBlock = (blockId) => { setSelectedBlocks(prev => prev.includes(blockId) ? prev.filter(id => id !== blockId) : [...prev, blockId]); };
    const handleBulkAction = async (action) => { const originalBlocks = [...blocks]; const actionVerb = { enable: 'bật', disable: 'tắt', delete: 'xóa' }; if (action === 'delete') { setBlocks(prev => prev.filter(b => !selectedBlocks.includes(b.id))); } else { const isEnabled = action === 'enable'; setBlocks(prev => prev.map(b => selectedBlocks.includes(b.id) ? { ...b, isEnabled } : b)); } try { await axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/bulk-action`, { action, blockIds: selectedBlocks }); toast.success(`Đã ${actionVerb[action]} ${selectedBlocks.length} khối đã chọn!`); setSelectedBlocks([]); } catch (error) { toast.error('Hành động hàng loạt thất bại.'); setBlocks(originalBlocks); } };

    const OnboardingChecklist = () => {
        const tasks = [{ text: "Thêm ảnh đại diện", completed: !!initialProfile?.avatarUrl }, { text: "Thêm phần mô tả ngắn", completed: !!initialProfile?.description?.trim() }, { text: "Tạo liên kết đầu tiên", completed: blocks.length > 0 }, { text: "Tùy chỉnh giao diện", completed: initialProfile?.background !== 'dynamic-default-bg' }];
        const completedTasks = tasks.filter(task => task.completed).length;
        if (completedTasks === tasks.length) return null;
        const progress = (completedTasks / tasks.length) * 100;
        return (
            <Card className="p-6 border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Bắt đầu nào!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">Hoàn thành các bước sau để trang của bạn trông tuyệt nhất.</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4"><motion.div className="bg-blue-600 h-2.5 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeInOut" }} /></div>
                <ul className="space-y-3">{tasks.map((task, index) => (<li key={index} className="flex items-center text-sm">{task.completed ? <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" /> : <FaRegCircle className="text-slate-400 dark:text-slate-500 mr-3 flex-shrink-0" />}<span className={clsx({ 'text-slate-500 dark:text-slate-400 line-through': task.completed, 'text-slate-800 dark:text-slate-200': !task.completed })}>{task.text}</span></li>))}</ul>
            </Card>
        );
    };

    const renderMenuItem = (item) => (<Menu.Item key={item.label}>{({ active }) => (<button onClick={() => handleOpenModalToAdd(item)} className={clsx('group flex w-full items-center rounded-md px-3 py-2.5 text-sm transition-colors', { 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100': active, 'text-slate-700 dark:text-slate-300': !active })}>{item.icon} {item.label}</button>)}</Menu.Item>);

    if (isLoading) {
        return (
            <div className='bg-slate-50 dark:bg-slate-900 min-h-screen'>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
                    <div className="h-20 w-3/4 md:w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div><div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div><div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div></div>
                    <div className="h-14 w-full rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <SkeletonLoader />
                </main>
            </div>
        );
    }
    
    return (
        <motion.div initial="initial" animate="animate" exit="exit" className='bg-slate-50 dark:bg-slate-900 min-h-screen'>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored"/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div variants={staggerContainer} className="lg:col-span-2 space-y-8">
                        <motion.div variants={fadeInUp}>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Chào mừng trở lại, {currentUser.displayName || 'bạn'}!</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </motion.div>
                        
                        <QuickStats blocks={blocks} stats={stats} />
                        <OnboardingChecklist />

                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Link Bio của bạn</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Đây là liên kết công khai dẫn đến trang của bạn.</p>
                            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                <BiLinkAlt className="text-slate-400 mx-2 hidden sm:block" />
                                <a href={bioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-mono flex-grow truncate text-center sm:text-left">{bioLink}</a>
                                <div className="flex items-center bg-white dark:bg-slate-700 rounded-md shadow-sm">
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyLink} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-md transition-colors" title="Sao chép link"><BiCopy size={20} /></motion.button>
                                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-600"></div>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsQrModalOpen(true)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" title="Mã QR"><BiQrScan size={20} /></motion.button>
                                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-600"></div>
                                    <Menu as="div" className="relative">
                                        <Menu.Button as={motion.button} whileTap={{ scale: 0.9 }} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-md transition-colors" title="Chia sẻ"><BiShareAlt size={20} /></Menu.Button>
                                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black dark:ring-slate-600 ring-opacity-5 focus:outline-none">
                                                <div className="py-1"><Menu.Item>{({ active }) => (<a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bioLink)}`} target="_blank" rel="noopener noreferrer" className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} text-slate-700 dark:text-slate-300 group flex items-center w-full px-4 py-2 text-sm transition-colors`}><FaFacebook className="mr-3" /> Facebook</a>)}</Menu.Item><Menu.Item>{({ active }) => (<a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(bioLink)}&text=${encodeURIComponent('Xem trang của tôi!')}`} target="_blank" rel="noopener noreferrer" className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} text-slate-700 dark:text-slate-300 group flex items-center w-full px-4 py-2 text-sm transition-colors`}><FaTwitter className="mr-3" /> Twitter / X</a>)}</Menu.Item></div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <Tab.Group><Tab.List className="flex -mb-px px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700"><Tab className={({ selected }) => clsx('flex items-center gap-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none transition-all duration-300', selected ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500')}><BiCog /> Chung</Tab><Tab className={({ selected }) => clsx('flex items-center gap-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ml-8', selected ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500')}><BiPalette /> Giao diện</Tab><Tab className={({ selected }) => clsx('flex items-center gap-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none ml-8', selected ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500')}><BiShareAlt /> SEO & Marketing</Tab></Tab.List>
                                <Tab.Panels className="mt-2">
                                    <Tab.Panel as={motion.div} variants={staggerContainer} initial="initial" animate="animate" className="p-6 space-y-6"><FormItem label="Tên hiển thị"><StyledInput type="text" name="displayName" value={settings.displayName} onChange={handleSettingsChange} placeholder="Ví dụ: Nguyễn Văn A" /></FormItem><FormItem label="Mô tả"><StyledTextarea name="description" value={settings.description} onChange={handleSettingsChange} placeholder="🎨 Artist | 🎮 Gamer | 📍 Hà Nội" /></FormItem><FormItem label="URL Tùy Chỉnh"><div className="flex items-center mt-1"><span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm">{window.location.host}/</span><StyledInput type="text" name="slug" value={settings.slug} onChange={handleSettingsChange} className="rounded-l-none" /></div></FormItem></Tab.Panel>
                                    <Tab.Panel as={motion.div} variants={staggerContainer} initial="initial" animate="animate" className="p-6 space-y-8"><motion.div variants={fadeInUp} className="space-y-6"><div><h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Chọn mẫu nền</h3><div className="grid grid-cols-4 sm:grid-cols-6 gap-3">{backgroundOptions.map(option => (<div key={option.name}><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSettings(prev => ({ ...prev, background: option.value }))} className={clsx('w-full aspect-square rounded-lg focus:outline-none relative overflow-hidden border dark:border-slate-700 transition-all', settings.background === option.value ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800' : 'ring-1 ring-transparent hover:ring-blue-400')}><div className="absolute inset-0" style={{ background: option.preview }}></div><AnimatePresence>{settings.background === option.value && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute inset-0 bg-black/40 flex items-center justify-center"><BiCheck className="text-white text-2xl" /></motion.div>)}</AnimatePresence></motion.button><p className="text-xs text-center mt-1.5 text-slate-500 dark:text-slate-400">{option.name}</p></div>))}</div></div><div><h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">... hoặc tải ảnh của bạn</h3>{settings.background.startsWith('http') && (<div className="mb-3 w-full aspect-video rounded-lg relative overflow-hidden border dark:border-slate-700 ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800"><div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${settings.background})` }}></div><motion.button whileTap={{ scale: 0.9 }} onClick={() => setSettings(prev => ({ ...prev, background: 'dynamic-default-bg' }))} className="absolute top-2 right-2 bg-white/50 dark:bg-slate-800/50 rounded-full p-1 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700"><BiX /></motion.button><div className="absolute inset-0 bg-black/30 flex items-center justify-center"><BiCheck className="text-white text-2xl" /></div></div>)}<input type="file" ref={bgFileInputRef} onChange={onBgImageChange} className="hidden" accept="image/*" disabled={isUploadingBg} /><motion.button whileTap={{ scale: 0.98 }} onClick={() => bgFileInputRef.current.click()} disabled={isUploadingBg} className="w-full flex items-center justify-center gap-x-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">{isUploadingBg ? (<> <div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Đang tải...</span> </>) : (<> <BiUpload /> <span>{settings.background.startsWith('http') ? 'Chọn ảnh khác' : 'Tải ảnh nền'}</span> </>)}</motion.button></div>{settings.background.startsWith('http') && (<div><label htmlFor="opacity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Độ đậm lớp phủ: {settings.backgroundImageOpacity}%</label><input id="opacity" type="range" min="0" max="90" name="backgroundImageOpacity" value={settings.backgroundImageOpacity} onChange={(e) => setSettings(prev => ({ ...prev, backgroundImageOpacity: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer mt-1.5" /></div>)}</motion.div><hr className="border-slate-200 dark:border-slate-700" /><motion.div variants={fadeInUp} className='space-y-6'><FormItem label="Kiểu dáng nút"><div className='flex flex-wrap gap-2 mt-2'>{buttonStyleOptions.map(opt => <motion.button whileTap={{ scale: 0.95 }} key={opt.value} onClick={() => setSettings(p => ({ ...p, buttonStyle: opt.value }))} className={clsx('px-4 py-2 text-sm border rounded-lg transition-colors', settings.buttonStyle === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500')}>{opt.name}</motion.button>)}</div></FormItem><FormItem label="Hình dạng nút"><div className='flex flex-wrap gap-2 mt-2'>{buttonShapeOptions.map(opt => <motion.button whileTap={{ scale: 0.95 }} key={opt.value} onClick={() => setSettings(p => ({ ...p, buttonShape: opt.value }))} className={clsx('px-4 py-2 text-sm border rounded-lg transition-colors', settings.buttonShape === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500')}>{opt.name}</motion.button>)}</div></FormItem><FormItem label="Font chữ"><div className='flex flex-wrap gap-2 mt-2'>{fontOptions.map(opt => <motion.button whileTap={{ scale: 0.95 }} key={opt.value} onClick={() => setSettings(p => ({ ...p, font: opt.value }))} className={clsx('px-4 py-2 text-sm border rounded-lg transition-colors', {'bg-blue-600 text-white border-blue-600': settings.font === opt.value, 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500': settings.font !== opt.value}, opt.value)}>{opt.name}</motion.button>)}</div></FormItem><FormItem label="Màu chữ chính" description="Áp dụng cho tên và mô tả."><div className="flex items-center gap-x-3 mt-2"><input type="color" name="fontColor" value={settings.fontColor || '#FFFFFF'} onChange={handleSettingsChange} className="w-10 h-10 p-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer" /><span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{settings.fontColor || '#FFFFFF'}</span></div></FormItem></motion.div></Tab.Panel>
                                    <Tab.Panel as={motion.div} variants={staggerContainer} initial="initial" animate="animate" className="p-6 space-y-6"><FormItem label="Tiêu đề trang (SEO)" description="Tiêu đề hiển thị trên tab trình duyệt và khi chia sẻ."><StyledInput type="text" name="seoTitle" value={settings.seoTitle} onChange={handleSettingsChange} placeholder={initialProfile.displayName} /></FormItem><FormItem label="Mô tả trang (SEO)" description="Mô tả ngắn gọn khi chia sẻ link lên mạng xã hội."><StyledTextarea name="seoDescription" value={settings.seoDescription} onChange={handleSettingsChange} placeholder={initialProfile.description} /></FormItem><FormItem label="Ảnh đại diện khi chia sẻ">{settings.socialImage && (<div className='mt-2 mb-2 w-full aspect-[1.91/1] rounded-lg relative overflow-hidden border dark:border-slate-700'><img src={settings.socialImage} alt="Social preview" className="object-cover w-full h-full" /><motion.button whileTap={{ scale: 0.9 }} onClick={() => setSettings(p => ({ ...p, socialImage: '' }))} className="absolute top-2 right-2 bg-white/70 dark:bg-slate-800/70 rounded-full p-1 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700"><BiX /></motion.button></div>)}<input type="file" ref={socialImgFileInputRef} onChange={onSocialImageChange} className="hidden" accept="image/*" disabled={isUploadingSocial} /><motion.button whileTap={{ scale: 0.98 }} onClick={() => socialImgFileInputRef.current.click()} disabled={isUploadingSocial} className='w-full flex items-center justify-center gap-x-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors'>{isUploadingSocial ? (<> <div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full animate-spin"></div> <span>Đang tải...</span> </>) : (<> <BiUpload /> <span>{settings.socialImage ? 'Thay ảnh khác' : 'Tải ảnh lên'}</span> </>)}</motion.button></FormItem><hr className="border-slate-200 dark:border-slate-700" /><FormItem label="Google Analytics ID" description="Dán ID đo lường từ Google Analytics để theo dõi chi tiết."><StyledInput type="text" name="googleAnalyticsId" value={settings.googleAnalyticsId || ''} onChange={handleSettingsChange} placeholder="G-XXXXXXXXXX" /></FormItem><FormItem label="Facebook Pixel ID" description="Dán ID Pixel của bạn để theo dõi chuyển đổi từ Facebook Ads."><StyledInput type="text" name="facebookPixelId" value={settings.facebookPixelId || ''} onChange={handleSettingsChange} placeholder="123456789012345" /></FormItem></Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                            <div className="text-right mt-2 border-t dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl"><motion.button whileTap={{ scale: 0.95 }} onClick={handleProfileSave} disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">{isSavingProfile ? (<div className="flex items-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div><span>Đang lưu...</span></div>) : 'Lưu Thay Đổi'}</motion.button></div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Các khối nội dung</h2>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <div className="relative flex-grow"><BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /><input type="text" placeholder="Tìm kiếm khối..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" /></div>
                                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-1 rounded-lg"><button onClick={() => setLayout('list')} className={clsx('p-1.5 rounded-md transition-colors', { 'bg-white dark:bg-slate-800 shadow text-blue-600': layout === 'list', 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100': layout !== 'list' })}><BiListUl size={20} /></button><button onClick={() => setLayout('grid')} className={clsx('p-1.5 rounded-md transition-colors', { 'bg-white dark:bg-slate-800 shadow text-blue-600': layout === 'grid', 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100': layout !== 'grid' })}><BiGridAlt size={20} /></button></div>
                                        <Menu as="div" className="relative"><Menu.Button as={motion.button} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-x-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"><BiPlus className="h-5 w-5 -ml-1" /> Thêm khối</Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black dark:ring-slate-600 ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto"><div className="p-1"><p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ủng hộ</p>{monetizationLinks.map(renderMenuItem)}</div><hr className="my-1 border-slate-200 dark:border-slate-700" /><div className="p-1"><p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mạng xã hội</p>{socialLinks.map(renderMenuItem)}</div><hr className="my-1 border-slate-200 dark:border-slate-700" /><div className="p-1"><p className="px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Nội dung nhúng</p>{embedContent.map(renderMenuItem)}</div></Menu.Items></Transition>
                                        </Menu>
                                    </div>
                                </div>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={filteredBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        <motion.div variants={staggerContainer} initial="initial" animate="animate" className={clsx({ 'grid grid-cols-1 md:grid-cols-2 gap-4': layout === 'grid' })}>
                                            {filteredBlocks.length > 0 ? (
                                                filteredBlocks.map(block => (<SortableItem key={block.id} id={block.id} block={block} stats={stats} onEdit={handleOpenModalToEdit} onDelete={handleDeleteBlock} onToggleStatus={handleToggleStatus} isSelected={selectedBlocks.includes(block.id)} onSelect={handleSelectBlock} layout={layout} />))
                                            ) : (
                                                <motion.div variants={fadeInUp} className="text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg col-span-full my-4">
                                                    <BiSearch size={48} className="mx-auto text-slate-400 dark:text-slate-500" />
                                                    <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">{blocks.length === 0 ? 'Trang của bạn chưa có khối nào' : 'Không tìm thấy khối nào'}</p>
                                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{blocks.length === 0 ? 'Nhấn "+ Thêm khối" để bắt đầu.' : 'Hãy thử một từ khóa khác.'}</p>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </Card>
                    </motion.div>
                    
                    <motion.div variants={fadeInUp} className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-8"><MobilePreview profile={{...initialProfile, ...settings}} blocks={blocks} /></div>
                    </motion.div>
                </motion.div>
            </main>
            
            <AnimatePresence>
                {selectedBlocks.length > 0 && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 p-2 z-40 flex items-center gap-2">
                        <p className="text-sm font-medium px-3 text-slate-700 dark:text-slate-200">{selectedBlocks.length} đã chọn</p>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                        <button onClick={() => handleBulkAction('enable')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-green-500 transition-colors" title="Bật các khối đã chọn"><BiShow size={20} /></button>
                        <button onClick={() => handleBulkAction('disable')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-yellow-500 transition-colors" title="Tắt các khối đã chọn"><BiHide size={20} /></button>
                        <button onClick={() => handleBulkAction('delete')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-red-500 transition-colors" title="Xóa các khối đã chọn"><BiTrash size={20} /></button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                        <button onClick={() => setSelectedBlocks([])} className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors" title="Bỏ chọn tất cả"><BiX size={22} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <EditBlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBlock} block={editingBlock} modalInfo={modalInfo} />
            
            <AnimatePresence>
                {isQrModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsQrModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()} ref={qrCodeRef} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl">
                            <h3 className='text-center font-bold text-lg mb-4 text-slate-800 dark:text-slate-100'>Link Bio của bạn</h3>
                            <div className="p-4 bg-white rounded-md"><QRCodeSVG value={bioLink} size={256} level="H" includeMargin={true} /></div>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownloadQr} className='w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors'>Tải về (PNG)</motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal isOpen={confirmState.isOpen} onClose={() => setConfirmState({ ...confirmState, isOpen: false })} onConfirm={confirmState.onConfirm} title={confirmState.title}>
                {confirmState.message}
            </ConfirmModal>
        </motion.div>
    );
}