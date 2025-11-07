import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BiTrash, BiLock, BiGlobe, BiReply, BiSend } from 'react-icons/bi';
import { FaInbox } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

const InboxSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 flex gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const MessageItem = ({ msg, onDelete, onReply }) => {
    const [showReply, setShowReply] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        setIsReplying(true);
        const success = await onReply(replyContent);
        if (success) {
            setShowReply(false);
            setReplyContent('');
        }
        setIsReplying(false);
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const timeAgo = formatDistanceToNowStrict(new Date(msg.createdAt), { addSuffix: true, locale: vi });

    const isAuthor = msg.isAuthor;

    return (
        <div className={`p-5 rounded-2xl flex flex-col sm:flex-row gap-4 transition-colors ${isAuthor ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
            <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-3">
                        <p className={`font-semibold ${isAuthor ? 'text-blue-800 dark:text-blue-300' : 'text-gray-800 dark:text-gray-100'}`}>{msg.authorName}</p>
                        {!isAuthor && (msg.isPublic ? (
                            <span className="flex items-center text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full"><BiGlobe className="mr-1"/> Công khai</span>
                        ) : (
                            <span className="flex items-center text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full"><BiLock className="mr-1"/> Riêng tư</span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0" title={formatDate(msg.createdAt)}>{timeAgo}</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.messageContent}</p>
                
                {showReply && (
                    <div className="mt-4 space-y-2">
                        <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder={`Trả lời ${msg.authorName}...`} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none" rows="2"/>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowReply(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500">Hủy</button>
                            <button onClick={handleReplySubmit} disabled={isReplying} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                                {isReplying ? 'Đang gửi...' : <><BiSend/> Gửi</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 sm:pl-4 flex sm:flex-col gap-2 items-center">
                {!isAuthor && <button onClick={() => setShowReply(!showReply)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full"><BiReply size={18}/></button>}
                <button onClick={() => onDelete(msg.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full"><BiTrash size={18}/></button>
            </div>
        </div>
    );
};

export default function Inbox({ currentUser, showToast }) {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmState, setConfirmState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const fetchMessages = async () => {
        if (!currentUser) return;
        !isLoading && setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/mine/${currentUser.uid}`);
            setMessages(response.data);
        } catch (error) {
            console.error("Lỗi khi tải tin nhắn:", error);
            showToast("Không thể tải tin nhắn", "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => { fetchMessages(); }, [currentUser]);
    
    const handleDelete = (messageId) => {
        setConfirmState({
            isOpen: true,
            title: "Xác nhận xóa tin nhắn",
            message: "Bạn có chắc muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.",
            onConfirm: async () => {
                try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/${messageId}?userId=${currentUser.uid}`);
                    setMessages(prev => prev.filter(msg => msg.id !== messageId));
                    showToast("Đã xóa tin nhắn", "success");
                } catch (error) {
                    showToast("Xóa tin nhắn thất bại", "error");
                }
            }
        });
    };

    const handleReply = async (replyContent) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/guestbook/comment-as-author?userId=${currentUser.uid}`, { messageContent: replyContent });
            showToast("Đã gửi trả lời", "success");
            fetchMessages(); // Tải lại danh sách tin nhắn
            return true;
        } catch (error) {
            showToast("Gửi trả lời thất bại", "error");
            return false;
        }
    };

    if (isLoading) return <InboxSkeleton />;

    return (
        <>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3"><FaInbox className="text-blue-600 dark:text-blue-400"/> Hòm thư</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nơi nhận lời nhắn từ khách truy cập trang BioLink của bạn.</p>
                </div>
                
                {messages.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4"><FaInbox size={28}/></div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Hòm thư trống</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bạn chưa nhận được lời nhắn nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <MessageItem key={msg.id} msg={msg} onDelete={handleDelete} onReply={handleReply} />
                        ))}
                    </div>
                )}
            </div>
            
            <ConfirmModal isOpen={confirmState.isOpen} onClose={() => setConfirmState({ ...confirmState, isOpen: false })} onConfirm={confirmState.onConfirm} title={confirmState.title}>
                {confirmState.message}
            </ConfirmModal>
        </>
    );
}