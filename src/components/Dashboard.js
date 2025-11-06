import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BiPencil, BiTrash, BiMenu, BiBarChart, BiCopy } from 'react-icons/bi';
import EditBlockModal from './EditBlockModal';
import { useAuth } from '../context/AuthContext';

function SortableItem({ id, block, stats, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };
    const data = JSON.parse(block.data);
    const clickCount = stats[id] || 0;

    return (
        <div ref={setNodeRef} style={style} className="flex items-center bg-white rounded-lg p-3 mb-3 shadow transition-shadow hover:shadow-md">
            <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none">
                <BiMenu size={22} />
            </button>
            <div className="flex-grow ml-3">
                <p className="font-semibold text-gray-800">{data.title || 'Chưa có tiêu đề'}</p>
                <p className="text-sm text-gray-500 truncate">{data.url || ''}</p>
            </div>
            <div className="flex items-center text-gray-500 text-sm mr-4">
                <BiBarChart className="mr-1" />
                <span>{clickCount}</span>
            </div>
            <button onClick={() => onEdit(block)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full focus:outline-none"><BiPencil size={20} /></button>
            <button onClick={() => onDelete(block.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full focus:outline-none"><BiTrash size={20} /></button>
        </div>
    );
}

export default function Dashboard({ profile: initialProfile, onProfileUpdate }) {
    const { currentUser } = useAuth();
    const [blocks, setBlocks] = useState(initialProfile?.blocks || []);
    const [stats, setStats] = useState({});
    const [displayName, setDisplayName] = useState(initialProfile?.displayName || '');
    const [description, setDescription] = useState(initialProfile?.description || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const bioLink = `${window.location.origin}/${initialProfile?.slug}`;

    useEffect(() => {
        setBlocks(initialProfile?.blocks || []);
        setDisplayName(initialProfile?.displayName || '');
        setDescription(initialProfile?.description || '');
        if (currentUser?.uid) {
            axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/stats/${currentUser.uid}`)
                .then(response => setStats(response.data))
                .catch(err => console.error("Không thể tải thống kê:", err));
        }
    }, [initialProfile, currentUser]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(bioLink);
        alert("Đã sao chép link!");
    };

    const handleProfileSave = async () => {
        setIsSavingProfile(true);
        const profileData = {
            displayName,
            description,
            avatarUrl: initialProfile.avatarUrl,
            userId: currentUser.uid,
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, profileData);
            onProfileUpdate(response.data);
            alert("Đã lưu thông tin chung!");
        } catch (err) {
            alert("Lưu thông tin thất bại.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                const orderedIds = newOrder.map(b => b.id);
                axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/reorder/${currentUser.uid}`, orderedIds)
                    .catch(err => alert("Lỗi khi sắp xếp. Vui lòng thử lại."));
                return newOrder;
            });
        }
    };

    const handleOpenModalToAdd = () => {
        setEditingBlock(null);
        setIsModalOpen(true);
    };

    const handleOpenModalToEdit = (block) => {
        setEditingBlock(block);
        setIsModalOpen(true);
    };

    const handleDeleteBlock = async (blockId) => {
        if (window.confirm("Bạn có chắc muốn xóa khối này không?")) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/blocks/${blockId}`);
                setBlocks(prev => prev.filter(b => b.id !== blockId));
            } catch (err) {
                alert("Xóa khối thất bại. Vui lòng thử lại.");
            }
        }
    };

    const handleSaveBlock = async (data) => {
        const blockData = { type: 'link', data: JSON.stringify(data) };
        try {
            if (editingBlock) {
                const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/blocks/${editingBlock.id}`, blockData);
                setBlocks(prev => prev.map(b => b.id === editingBlock.id ? response.data : b));
            } else {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/${currentUser.uid}`, blockData);
                setBlocks(prev => [...prev, response.data]);
            }
        } catch (err) {
            alert("Lưu khối thất bại. Vui lòng thử lại.");
        }
        setEditingBlock(null);
    };

    if (!initialProfile) return <p>Đang tải dashboard...</p>;

    return (
        <>
            <div className="p-6 bg-white rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Link Bio của bạn</h2>
                <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
                    <a href={bioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono flex-grow truncate">{bioLink}</a>
                    <button onClick={handleCopyLink} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                        <BiCopy size={20} />
                    </button>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Cài đặt chung</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="text-right">
                        <button onClick={handleProfileSave} disabled={isSavingProfile} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">
                            {isSavingProfile ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Quản lý các khối</h2>
                    <button onClick={handleOpenModalToAdd} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        + Thêm khối mới
                    </button>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {blocks.length > 0 ? (
                            blocks.map(block => (
                                <SortableItem key={block.id} id={block.id} block={block} stats={stats} onEdit={handleOpenModalToEdit} onDelete={handleDeleteBlock} />
                            ))
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed rounded-lg text-gray-500">
                                <p>Bạn chưa có khối nào. Nhấn "+ Thêm khối mới" để bắt đầu.</p>
                            </div>
                        )}
                    </SortableContext>
                </DndContext>
            </div>
            <EditBlockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveBlock} block={editingBlock} />
        </>
    );
}