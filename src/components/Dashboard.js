import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Menu, Transition, Tab } from '@headlessui/react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BiPencil, BiTrash, BiMenu, BiBarChart, BiCopy, BiChevronDown, BiPalette, BiCog, BiCheck, BiUpload, BiX, BiImage } from 'react-icons/bi';
import { FaLink, FaYoutube, FaHeading, FaSpotify, FaSoundcloud, FaTiktok, FaFacebook, FaInstagram, FaGithub, FaTwitter, FaTelegramPlane, FaDiscord, FaWhatsapp } from 'react-icons/fa';
import { SiZalo, SiLeagueoflegends } from 'react-icons/si';
import { IoGameController } from 'react-icons/io5';

import EditBlockModal from './EditBlockModal';
import { useAuth } from '../context/AuthContext';
import { getIconForUrl } from '../utils/icons';

function SortableItem({ id, block, stats, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 'auto', opacity: isDragging ? 0.5 : 1 };
    const data = JSON.parse(block.data);
    const clickCount = stats[id] || 0;
    let icon, title, subtitle;

    switch(block.type) {
        case 'youtube': 
            icon = <FaYoutube className="text-red-500" />; 
            title = data.title || "Video YouTube"; 
            subtitle = data.url; 
            break;
        case 'header': 
            icon = <FaHeading className="text-gray-700"/>; 
            title = data.text; 
            subtitle = "Tiêu đề phân cách"; 
            break;
        case 'image':
            icon = <BiImage className="text-purple-500" />;
            title = data.title || "Hình ảnh";
            subtitle = 'Một hình ảnh tùy chỉnh';
            break;
        case 'spotify': 
            icon = <FaSpotify className="text-green-500" />; 
            title = data.title || "Nhạc Spotify"; 
            subtitle = data.url; 
            break;
        case 'soundcloud': 
            icon = <FaSoundcloud className="text-orange-500" />; 
            title = data.title || "Nhạc SoundCloud"; 
            subtitle = data.url; 
            break;
        case 'tiktok': 
            icon = <FaTiktok className="text-black" />; 
            title = data.title || "Video TikTok"; 
            subtitle = data.url; 
            break;
        default: 
            icon = getIconForUrl(data.url); 
            title = data.title; 
            subtitle = data.url; 
            break;
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center bg-white rounded-lg p-3 mb-3 shadow transition-shadow hover:shadow-md">
            <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none flex-shrink-0"><BiMenu size={22} /></button>
            <div className="text-xl text-gray-500 mx-3 w-6 text-center flex-shrink-0">{icon}</div>
            <div className="flex-grow min-w-0"><p className="font-semibold text-gray-800 break-words">{title || 'Chưa có tiêu đề'}</p><p className="text-sm text-gray-500 truncate">{subtitle || ''}</p></div>
            <div className="flex items-center text-gray-500 text-sm ml-4 mr-2 flex-shrink-0"><BiBarChart className="mr-1"/><span>{clickCount}</span></div>
            <button onClick={() => onEdit(block)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full focus:outline-none flex-shrink-0"><BiPencil size={20} /></button>
            <button onClick={() => onDelete(block.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full focus:outline-none flex-shrink-0"><BiTrash size={20} /></button>
        </div>
    );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const backgroundOptions = [ { name: 'Mặc định động', value: 'dynamic-default-bg', preview: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)' }, { name: 'Sóng Synthwave', value: 'dynamic-vaporwave-bg', preview: 'linear-gradient(-45deg, #ff71ce, #01cdfe, #05ffa1, #b967ff)' }, { name: 'Đơn sắc', value: 'dynamic-mono-bg', preview: 'linear-gradient(-45deg, #000000, #434343, #a1a1a1, #ffffff)' }, { name: 'Than chì', value: 'dynamic-charcoal-bg', preview: 'linear-gradient(-45deg, #1e1e1e, #3e3e3e, #1e1e1e, #000000)' }, { name: 'Dung nham', value: 'dynamic-lava-bg', preview: 'linear-gradient(-45deg, #ff4e00, #ff0000, #d4a22c, #ff4e00)' }, { name: 'Rừng sâu', value: 'dynamic-forest-bg', preview: 'linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #203a43)' }, { name: 'Bầu trời', value: 'dynamic-sky-bg', preview: 'linear-gradient(-45deg, #37a2f5, #b4eaff, #85d5fc, #37a2f5)' }, { name: 'Hoàng hôn', value: 'linear-gradient(to right, #ff7e5f, #feb47b)', preview: 'linear-gradient(to right, #ff7e5f, #feb47b)' }, { name: 'Đại dương', value: 'linear-gradient(to right, #00c6ff, #0072ff)', preview: 'linear-gradient(to right, #00c6ff, #0072ff)' }, { name: 'Tinh vân', value: 'linear-gradient(to right, #8e2de2, #4a00e0)', preview: 'linear-gradient(to right, #8e2de2, #4a00e0)' }, { name: 'Xám Tối', value: 'linear-gradient(to right, #434343, #000000)', preview: 'linear-gradient(to right, #434343, #000000)' }, ];

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

export default function Dashboard({ profile: initialProfile, onProfileUpdate }) {
    const { currentUser } = useAuth();
    const [blocks, setBlocks] = useState(initialProfile?.blocks || []);
    const [stats, setStats] = useState({});
    
    const [settings, setSettings] = useState({
      displayName: initialProfile?.displayName || '',
      description: initialProfile?.description || '',
      slug: initialProfile?.slug || '',
      background: initialProfile?.background || 'dynamic-default-bg',
      backgroundImageOpacity: initialProfile?.backgroundImageOpacity || 50,
    });
    
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingBg, setIsUploadingBg] = useState(false);
    const bgFileInputRef = React.useRef(null);
    const bioLink = `${window.location.origin}/${settings.slug}`;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [modalInfo, setModalInfo] = useState({ type: 'link', label: 'Liên kết' });
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    
    const socialLinks = [ { type: 'link', label: 'Facebook', icon: <FaFacebook className="mr-3"/>, placeholder: 'https://facebook.com/your-username' }, { type: 'link', label: 'Instagram', icon: <FaInstagram className="mr-3"/>, placeholder: 'https://instagram.com/your-username' }, { type: 'link', label: 'X / Twitter', icon: <FaTwitter className="mr-3"/>, placeholder: 'https://twitter.com/your-handle' }, { type: 'link', label: 'GitHub', icon: <FaGithub className="mr-3"/>, placeholder: 'https://github.com/your-username' }, { type: 'link', label: 'Telegram', icon: <FaTelegramPlane className="mr-3"/>, placeholder: 'Tên người dùng Telegram', prefix: 'https://t.me/' }, { type: 'link', label: 'Zalo', icon: <SiZalo className="mr-3"/>, placeholder: 'Số điện thoại của bạn', prefix: 'https://zalo.me/' }, { type: 'link', label: 'WhatsApp', icon: <FaWhatsapp className="mr-3"/>, placeholder: 'Số điện thoại của bạn', prefix: 'https://wa.me/' }, { type: 'link', label: 'Discord', icon: <FaDiscord className="mr-3"/>, placeholder: 'Link mời server Discord', prefix: 'https://discord.gg/' }, { type: 'link', label: 'LMHT / Riot', icon: <SiLeagueoflegends className="mr-3"/>, placeholder: 'https://www.leagueoflegends.com/' }, { type: 'link', label: 'Game (Hoyoverse)', icon: <IoGameController className="mr-3"/>, placeholder: 'Link profile Hoyolab/Game' }, { type: 'link', label: 'Game khác', icon: <IoGameController className="mr-3"/>, placeholder: 'Dán link profile game của bạn' }, { type: 'link', label: 'Link tùy chỉnh', icon: <FaLink className="mr-3"/>, placeholder: 'https://your-website.com' }, ];
    
    const embedContent = [ { type: 'header', label: 'Tiêu đề', icon: <FaHeading className="mr-3" /> }, { type: 'image', label: 'Hình ảnh', icon: <BiImage className="mr-3" /> }, { type: 'youtube', label: 'Video YouTube', icon: <FaYoutube className="mr-3" /> }, { type: 'tiktok', label: 'Video TikTok', icon: <FaTiktok className="mr-3" /> }, { type: 'spotify', label: 'Nhạc Spotify', icon: <FaSpotify className="mr-3" /> }, { type: 'soundcloud', label: 'Nhạc SoundCloud', icon: <FaSoundcloud className="mr-3" /> }, ];

    useEffect(() => {
        setBlocks(initialProfile?.blocks || []);
        setSettings({
          displayName: initialProfile?.displayName || '',
          description: initialProfile?.description || '',
          slug: initialProfile?.slug || '',
          background: initialProfile?.background || 'dynamic-default-bg',
          backgroundImageOpacity: initialProfile?.backgroundImageOpacity || 50,
        });

        if (currentUser?.uid) {
            axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/stats/${currentUser.uid}`)
                .then(response => setStats(response.data))
                .catch(err => console.error("Không thể tải thống kê:", err));
        }
    }, [initialProfile, currentUser]);

    const handleBackgroundUpload = async (event) => { const file = event.target.files[0]; if (!file) return; setIsUploadingBg(true); const imageUrl = await handleImageUpload(file); if (imageUrl) { setSettings(prev => ({ ...prev, background: imageUrl })); } setIsUploadingBg(false); };
    const handleSettingsChange = (e) => { const { name, value } = e.target; if (name === 'slug') { const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, ''); setSettings(prev => ({...prev, [name]: sanitizedSlug})); } else { setSettings(prev => ({...prev, [name]: value})); } };
    const handleProfileSave = async () => { setIsSavingProfile(true); const profileData = { ...settings, userId: currentUser.uid, }; try { const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, profileData); onProfileUpdate(response.data); alert("Đã lưu cài đặt!"); } catch (err) { alert(err.response?.data?.message || "Lưu cài đặt thất bại."); } finally { setIsSavingProfile(false); } };
    const handleCopyLink = () => { navigator.clipboard.writeText(bioLink); alert("Đã sao chép link!"); };
    const handleDragEnd = (event) => { const { active, over } = event; if (over && active.id !== over.id) { setBlocks((items) => { const oldIndex = items.findIndex(item => item.id === active.id); const newIndex = items.findIndex(item => item.id === over.id); const newOrder = arrayMove(items, oldIndex, newIndex); const orderedIds = newOrder.map(b => b.id); axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/reorder/${currentUser.uid}`, orderedIds).catch(err => alert("Lỗi khi sắp xếp.")); return newOrder; }); } };
    const handleOpenModalToAdd = (item) => { setEditingBlock(null); setModalInfo(item); setIsModalOpen(true); };
    const handleOpenModalToEdit = (block) => { setEditingBlock(block); const label = embedContent.find(item => item.type === block.type)?.label || socialLinks.find(item => { try { return item.placeholder.includes(new URL(JSON.parse(block.data)?.url).hostname); } catch { return false; } })?.label || 'Link tùy chỉnh'; setModalInfo({ type: block.type, label }); setIsModalOpen(true); };
    const handleDeleteBlock = async (blockId) => { if (window.confirm("Bạn có chắc muốn xóa khối này không?")) { try { await axios.delete(`${process.env.REACT_APP_API_URL}/api/blocks/${blockId}`); setBlocks(prev => prev.filter(b => b.id !== blockId)); } catch (err) { alert("Xóa khối thất bại."); } } };
    const handleSaveBlock = async (rawData) => { const blockType = editingBlock ? editingBlock.type : modalInfo.type; let finalData = { ...rawData }; const socialInfo = socialLinks.find(item => item.label === modalInfo.label); if (blockType === 'link' && socialInfo && socialInfo.prefix && finalData.url && !finalData.url.startsWith('http')) { finalData.url = socialInfo.prefix + finalData.url; } const blockData = { type: blockType, data: JSON.stringify(finalData) }; try { if (editingBlock) { const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/blocks/${editingBlock.id}`, blockData); setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response.data : b)); } else { const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/${currentUser.uid}`, blockData); setBlocks(prev => [...prev, response.data]); } } catch (err) { alert("Lưu khối thất bại."); } setEditingBlock(null); };

    if (!initialProfile) return <p className="text-center">Đang tải dashboard...</p>;
    const renderMenuItem = (item) => (<Menu.Item key={item.label}>{({ active }) => (<button onClick={() => handleOpenModalToAdd(item)} className={`${ active ? 'bg-gray-100 text-gray-900' : 'text-gray-700' } group flex w-full items-center rounded-md px-2 py-2 text-sm`}>{item.icon} {item.label}</button>)}</Menu.Item>);

    const isCustomImage = settings.background.startsWith('http');

    return (
        <div className="space-y-8">
            <div className="p-6 bg-white rounded-2xl shadow-sm"><h2 className="text-xl font-bold text-gray-800 mb-4">Link Bio của bạn</h2><div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg"><a href={bioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono flex-grow truncate">{bioLink}</a><button onClick={handleCopyLink} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><BiCopy size={20} /></button></div></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                  <div className="p-6 bg-white rounded-2xl shadow-sm">
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
                          <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                            <div className='flex items-center justify-center gap-x-2'><BiCog/> Chung</div>
                          </Tab>
                           <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2', selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                             <div className='flex items-center justify-center gap-x-2'><BiPalette/> Giao diện</div>
                           </Tab>
                      </Tab.List>
                      <Tab.Panels className="mt-2">
                        <Tab.Panel className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                          <div className="space-y-4">
                            <div> <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label> <input type="text" name="displayName" value={settings.displayName} onChange={handleSettingsChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /> </div>
                            <div> <label className="block text-sm font-medium text-gray-700">Mô tả</label> <textarea name="description" value={settings.description} onChange={handleSettingsChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /> </div>
                            <div> <label className="block text-sm font-medium text-gray-700">URL Tùy Chỉnh</label> <div className="flex items-center mt-1"> <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">{window.location.host}/</span> <input type="text" name="slug" value={settings.slug} onChange={handleSettingsChange} className="block w-full border-gray-300 rounded-r-md shadow-sm" /> </div> </div>
                          </div>
                        </Tab.Panel>
                        <Tab.Panel className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                           <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">Chọn mẫu nền</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {backgroundOptions.map(option => (
                                            <button key={option.name} onClick={() => setSettings(prev => ({...prev, background: option.value}))} className="w-full aspect-square rounded-md focus:outline-none relative overflow-hidden border">
                                                <div className="absolute inset-0" style={{ background: option.preview }}></div>
                                                {settings.background === option.value && (
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                        <BiCheck className="text-white text-2xl" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600 mb-2">... hoặc tải ảnh của bạn</h3>
                                    {isCustomImage && (
                                         <div className="mb-2 w-full aspect-video rounded-md relative overflow-hidden border">
                                            <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${settings.background})` }}></div>
                                             <button onClick={() => setSettings(prev => ({...prev, background: 'dynamic-default-bg'}))} className="absolute top-1 right-1 bg-white/50 rounded-full p-1 text-gray-800 hover:bg-white">
                                                <BiX />
                                            </button>
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                <BiCheck className="text-white text-2xl" />
                                            </div>
                                         </div>
                                    )}
                                    <input type="file" ref={bgFileInputRef} onChange={handleBackgroundUpload} className="hidden" accept="image/*" disabled={isUploadingBg} />
                                    <button onClick={() => bgFileInputRef.current.click()} disabled={isUploadingBg} className="w-full flex items-center justify-center gap-x-2 px-4 py-2 border border-dashed rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        {isUploadingBg ? ( <> <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> <span>Đang tải...</span> </> ) : ( <> <BiUpload/> <span>{isCustomImage ? 'Chọn ảnh khác' : 'Tải ảnh nền'}</span> </> )}
                                    </button>
                                </div>
                                {isCustomImage && (
                                    <div>
                                        <label htmlFor="opacity" className="block text-sm font-medium text-gray-700">Độ đậm lớp phủ: {settings.backgroundImageOpacity}%</label>
                                        <input
                                            id="opacity"
                                            type="range"
                                            min="0"
                                            max="90"
                                            name="backgroundImageOpacity"
                                            value={settings.backgroundImageOpacity}
                                            onChange={(e) => setSettings(prev => ({...prev, backgroundImageOpacity: parseInt(e.target.value)}))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}
                           </div>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                    <div className="text-right mt-6">
                        <button onClick={handleProfileSave} disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                            {isSavingProfile ? 'Đang lưu...' : 'Lưu Cài Đặt'}
                        </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Các khối nội dung</h2>
                        <Menu as="div" className="relative inline-block text-left">
                            <div><Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-blue-600 hover:bg-blue-600">+ Thêm khối <BiChevronDown className="-mr-1 h-5 w-5 text-white" aria-hidden="true" /></Menu.Button></div>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-96 overflow-y-auto">
                                    <div className="p-1"><p className="px-2 py-1 text-xs font-semibold text-gray-400">MẠNG XÃ HỘI & GAME</p>{socialLinks.map(renderMenuItem)}</div>
                                    <hr className="my-1"/>
                                    <div className="p-1"><p className="px-2 py-1 text-xs font-semibold text-gray-400">NỘI DUNG NHÚNG</p>{embedContent.map(renderMenuItem)}</div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            {blocks.length > 0 ? (blocks.map(block => (<SortableItem key={block.id} id={block.id} block={block} stats={stats} onEdit={handleOpenModalToEdit} onDelete={handleDeleteBlock} />)))
                            : (<div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500"><p>Bạn chưa có khối nào. Nhấn "+ Thêm khối mới" để bắt đầu.</p></div>)}
                        </SortableContext>
                    </DndContext>
                </div>
            </div>
            
            <EditBlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBlock} block={editingBlock} modalInfo={modalInfo} socialLinks={socialLinks} />
        </div>
    );
}