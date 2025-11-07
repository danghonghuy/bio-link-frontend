import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BiUpload, BiX, BiPlus, BiTrash } from 'react-icons/bi';

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

export default function EditBlockModal({ isOpen, onClose, onSave, block, modalInfo = {type: 'link', label: 'Liên kết'} }) {
    const [data, setData] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIsUploading(false);
            if (block && block.data) {
                setData(JSON.parse(block.data));
            } else {
                 switch (modalInfo.type) {
                    case 'header': 
                        setData({ text: '' }); 
                        break;
                    case 'image': 
                        setData({ title: '', url: '' }); 
                        break;
                    case 'faq': 
                        setData({ title: 'Các câu hỏi thường gặp', items: [{ question: '', answer: '' }] }); 
                        break;
                    case 'youtube': 
                    case 'spotify': 
                    case 'soundcloud': 
                    case 'tiktok': 
                        setData({ title: '', url: '' }); 
                        break;
                    default: 
                        const initialTitle = modalInfo.label === 'Link tùy chỉnh' || modalInfo.label === 'Game khác' ? '' : modalInfo.label;
                        setData({ title: initialTitle, url: '', thumbnailUrl: '' }); 
                        break;
                }
            }
        }
    }, [block, isOpen, modalInfo]);

    const handleFileUpload = async (event, fieldName) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const imageUrl = await handleImageUpload(file);
        if (imageUrl) {
            setData(prev => ({ ...prev, [fieldName]: imageUrl }));
        }
        setIsUploading(false);
    }

    const handleSave = () => { onSave(data); onClose(); };
    
    const handleFaqChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData(prev => ({ ...prev, items: newItems }));
    };

    const addFaqItem = () => {
        setData(prev => ({ ...prev, items: [...prev.items, { question: '', answer: '' }] }));
    };

    const removeFaqItem = (indexToRemove) => {
        setData(prev => ({ ...prev, items: prev.items.filter((_, index) => index !== indexToRemove) }));
    };
    
    const renderFormFields = () => {
        const inputClass = "w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
        const titleInput = (placeholderText = "Tiêu đề") => ( <input type="text" value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder={placeholderText} className={inputClass} /> );
        const urlInput = (placeholderText) => ( <input type="text" value={data.url || ''} onChange={(e) => setData({ ...data, url: e.target.value })} placeholder={placeholderText} className={inputClass} /> );
        const blockType = block ? block.type : modalInfo.type;

        switch (blockType) {
            case 'header':
                return <input type="text" value={data.text || ''} onChange={(e) => setData({ text: e.target.value })} placeholder="Nội dung tiêu đề" className={inputClass} />;
            
            case 'image':
                return (
                    <div className="space-y-4">
                        {data.url ? ( <div className="w-full aspect-video rounded-md relative overflow-hidden border bg-gray-100"> <img src={data.url} alt="Xem trước" className="w-full h-full object-contain" /> <button onClick={() => setData(prev => ({...prev, url: ''}))} className="absolute top-1 right-1 bg-white/50 rounded-full p-1 text-gray-800 hover:bg-white"><BiX /></button> </div>
                        ) : ( <button onClick={() => imageInputRef.current.click()} disabled={isUploading} className="w-full flex items-center justify-center gap-x-2 px-4 py-10 border-2 border-dashed rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"> {isUploading ? ( <> <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> <span>Đang tải...</span> </> ) : ( <> <BiUpload size={20}/> <span>Nhấn để tải ảnh lên</span> </> )} </button> )}
                       <input type="file" ref={imageInputRef} onChange={(e) => handleFileUpload(e, 'url')} className="hidden" accept="image/*" disabled={isUploading}/>
                       {titleInput("Chú thích cho ảnh (tùy chọn)")}
                    </div>
                )

            case 'faq':
                return (
                    <div className="space-y-4">
                        {titleInput("Tiêu đề khối FAQ (tùy chọn)")}
                        <div className="max-h-80 overflow-y-auto pr-2 border-t pt-4">
                        {data.items?.map((item, index) => (
                            <div key={index} className="p-3 border rounded-lg space-y-2 bg-gray-50 relative mb-4">
                                <input
                                    type="text"
                                    value={item.question}
                                    onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                    placeholder={`Câu hỏi ${index + 1}`}
                                    className={`${inputClass} font-semibold`}
                                />
                                <textarea
                                    value={item.answer}
                                    onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                    placeholder="Nội dung trả lời..."
                                    rows={3}
                                    className={`${inputClass} text-sm`}
                                />
                                {data.items.length > 1 && (
                                     <button onClick={() => removeFaqItem(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow">
                                         <BiTrash size={16}/>
                                     </button>
                                )}
                            </div>
                        ))}
                        </div>
                        <button onClick={addFaqItem} className="flex items-center gap-2 w-full justify-center px-4 py-2 border-2 border-dashed rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                            <BiPlus /> Thêm câu hỏi
                        </button>
                    </div>
                );

            case 'youtube': return <div className="space-y-4">{titleInput("Tiêu đề video (tùy chọn)")}{urlInput("Dán link video YouTube")}</div>;
            case 'spotify': return <div className="space-y-4">{titleInput("Tiêu đề nhạc (tùy chọn)")}{urlInput("Dán link bài hát/playlist Spotify")}</div>;
            case 'soundcloud': return <div className="space-y-4">{titleInput("Tiêu đề nhạc (tùy chọn)")}{urlInput("Dán link bài hát/playlist SoundCloud")}</div>;
            case 'tiktok': return <div className="space-y-4">{titleInput("Tiêu đề video (tùy chọn)")}{urlInput("Dán link video TikTok")}</div>;
            
            case 'link':
            default:
                const allLinks = []; // placeholder in case socialLinks is not passed
                const { placeholder } = allLinks.find(item => item.label === modalInfo.label) || { placeholder: 'https://...'};
                return (
                    <div className="flex items-center gap-x-4">
                        <div className="flex-shrink-0">
                             <input type="file" ref={thumbnailInputRef} onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} className="hidden" accept="image/*" disabled={isUploading}/>
                             <button onClick={() => thumbnailInputRef.current.click()} className={`w-24 h-24 rounded-md flex items-center justify-center border-2 border-dashed relative ${data.thumbnailUrl ? 'border-transparent' : 'border-gray-300'}`}>
                                {isUploading ? (<div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : data.thumbnailUrl ? (
                                    <>
                                        <img src={data.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-md"/>
                                        <div onClick={(e)=>{e.stopPropagation(); setData(p=>({...p,thumbnailUrl:''}))}} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow cursor-pointer"><BiX className="text-red-500"/></div>
                                    </>
                                ) : ( <BiUpload size={24} className="text-gray-400" /> )
                                }
                             </button>
                        </div>
                        <div className="space-y-3 flex-grow">
                           {titleInput("Tiêu đề")}
                           {urlInput(placeholder)}
                        </div>
                    </div>
                );
        }
    };
    
    const getTitle = () => {
        const action = block ? 'Chỉnh sửa' : 'Thêm';
        return `${action} ${modalInfo.label}`;
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black bg-opacity-30" /></Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">{getTitle()}</Dialog.Title>
                                <div className="mt-4">{renderFormFields()}</div>
                                <div className="mt-6 flex justify-end space-x-2">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200">Hủy</button>
                                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Lưu</button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}