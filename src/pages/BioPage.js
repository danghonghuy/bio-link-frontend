import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BlockRenderer from '../components/BlockRenderer'; 
import { BiTrendingUp } from 'react-icons/bi';
import { FaEye,FaCheckCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

export default function BioPage() {
    const { slug } = useParams();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

 useEffect(() => {
        const fetchProfileAndRecordView = async () => {
            if (!slug) { 
                setError('URL không hợp lệ.'); 
                setIsLoading(false); 
                return; 
            }
            setIsLoading(true);
            setError(''); // Reset lỗi trước mỗi lần fetch

            try {
                // Bước 1: Luôn lấy dữ liệu profile mới nhất để hiển thị cho người dùng.
                // Thao tác này phải được ưu tiên để trang tải nhanh.
                const profilePromise = axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}`);

                // Bước 2: Gửi yêu cầu ghi nhận lượt xem một cách độc lập ("fire-and-forget").
                // Chúng ta không cần đợi yêu cầu này hoàn thành để hiển thị trang.
                // Lỗi deadlock ở backend đã được sửa, nên việc gọi đồng thời đã an toàn.
                axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}/view`).catch(err => {
                    // Lỗi ghi nhận lượt xem không phải là lỗi nghiêm trọng, chỉ cần log ra console.
                    // Không nên hiển thị màn hình lỗi cho người dùng chỉ vì không đếm được view.
                    console.error("Lỗi khi ghi nhận lượt xem (không ảnh hưởng hiển thị):", err);
                });
                
                // Bước 3: Đợi dữ liệu profile từ Bước 1 trả về.
                const profileResponse = await profilePromise;
                const fetchedProfile = profileResponse.data;
                setProfile(fetchedProfile);
                
                // Bước 4: Dùng dữ liệu profile vừa nhận được để lấy stats.
                if (fetchedProfile.userId) {
                    try {
                        const statsResponse = await axios.get(
                            `${process.env.REACT_APP_API_URL}/api/profiles/stats/${fetchedProfile.userId}`
                        );
                        setStats(statsResponse.data);
                    } catch (err) {
                        console.error("Lỗi khi tải thống kê:", err);
                        // Stats không tải được cũng không phải lỗi nghiêm trọng để dừng cả trang.
                    }
                }
            } catch (err) {
                // Chỉ xử lý các lỗi nghiêm trọng (không tìm thấy profile, lỗi server 500 khi lấy data)
                if (err.response && err.response.status === 404) {
                    setError('Không tìm thấy profile này.');
                } else {
                    setError('Đã xảy ra lỗi khi tải trang.');
                }
                console.error("Lỗi khi tải profile:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileAndRecordView();
    }, [slug]);

    const Guestbook = () => {
        const [messages, setMessages] = useState([]);
        const [newMessage, setNewMessage] = useState({ authorName: '', messageContent: '', isPublic: true });
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState({ success: false, message: ''});
        
        useEffect(() => {
            const fetchPublicMessages = async () => {
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}/guestbook/public`);
                    setMessages(res.data);
                } catch (error) {
                    console.error("Lỗi tải tin nhắn công khai:", error);
                }
            };
            if(slug) {
                fetchPublicMessages();
            }
        }, [slug]);

        const handleChange = (e) => {
            const { name, value, type, checked } = e.target;
            setNewMessage(prev => ({...prev, [name]: type === 'checkbox' ? checked : value }));
        };
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            if(!newMessage.authorName.trim() || !newMessage.messageContent.trim()) {
                setSubmitStatus({ success: false, message: 'Vui lòng nhập tên và nội dung lời nhắn.'});
                return;
            }
            
            setIsSubmitting(true);
            setSubmitStatus({ success: false, message: ''});
            try {
                const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}/guestbook`, newMessage);
                if (newMessage.isPublic) {
                    setMessages(prev => [res.data, ...prev]);
                }
                setNewMessage({ authorName: '', messageContent: '', isPublic: true });
                setSubmitStatus({ success: true, message: 'Gửi lời nhắn thành công! Cảm ơn bạn.'});
            } catch (error) {
                setSubmitStatus({ success: false, message: 'Gửi thất bại, vui lòng thử lại.'});
            } finally {
                setIsSubmitting(false);
            }
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        };
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="w-full mt-12 bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
                <h3 className="text-xl font-bold text-white text-center mb-4">Để lại lời nhắn</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="authorName" value={newMessage.authorName} onChange={handleChange} placeholder="Tên của bạn" className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg p-3 border-none focus:ring-2 focus:ring-blue-400" />
                    <textarea name="messageContent" value={newMessage.messageContent} onChange={handleChange} placeholder="Viết lời nhắn ở đây..." rows={4} className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg p-3 border-none focus:ring-2 focus:ring-blue-400 resize-none"></textarea>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                         <div className="flex items-center gap-2">
                             <input type="checkbox" id="isPublic" name="isPublic" checked={newMessage.isPublic} onChange={handleChange} className="w-4 h-4 rounded text-blue-500 bg-white/20 border-white/30 focus:ring-blue-500" />
                             <label htmlFor="isPublic" className="text-sm text-white/80">Hiển thị công khai</label>
                         </div>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Đang gửi...' : 'Gửi lời nhắn'}
                        </button>
                    </div>
                    {submitStatus.message && (
                         <p className={`text-sm text-center pt-2 ${submitStatus.success ? 'text-green-300' : 'text-red-300'}`}>{submitStatus.message}</p>
                    )}
                </form>

                {messages.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/20">
                         <h4 className="text-lg font-semibold text-white text-center mb-4">Sổ lưu bút</h4>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                           {messages.map(msg => (
    <div key={msg.id} className={`p-3 rounded-lg animate-fade-in ${msg.isAuthor ? 'bg-blue-500/20 border border-blue-400' : 'bg-white/5'}`}>
        <p className="text-sm text-white" style={{whiteSpace: 'pre-wrap'}}>{msg.messageContent}</p>
        <div className="flex items-center justify-between mt-2">
            <p className="text-xs font-semibold text-blue-300 flex items-center gap-1">
                {msg.isAuthor && <FaCheckCircle size={12} className="text-blue-300" />} {/* Icon nhận diện */}
                __{msg.authorName}
                {msg.isAuthor && <span className="ml-1 text-xs font-normal text-white/70">(Tác giả)</span>} {/* Huy hiệu */}
            </p>
            <p className="text-xs text-white/50">{formatDate(msg.createdAt)}</p>
        </div>
    </div>
))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }


    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                <motion.div
                    className="flex flex-col items-center gap-6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                    <motion.h1
                        className="text-2xl font-bold text-white"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Đang tải...
                    </motion.h1>
                </motion.div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700">
                <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md">
                        <motion.div
                            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <motion.a
                            href="/"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Về trang chủ
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        );
    }

    const backgroundValue = profile?.background || 'dynamic-default-bg';
    let pageStyle = {};
    let pageClassName = `flex flex-col items-center min-h-screen w-full p-4 sm:p-8 ${profile?.font || 'font-inter'}`;

    if (backgroundValue.startsWith('http')) {
        const opacity = (profile?.backgroundImageOpacity ?? 50) / 100;
        const overlay = `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity}))`;
        pageStyle = {
            backgroundImage: `${overlay}, url(${backgroundValue})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
        };
    } else if (backgroundValue.startsWith('linear-gradient')) {
        pageStyle = { background: backgroundValue };
    } else {
        pageClassName += ` ${backgroundValue}`;
    }

    const sortedBlocks = profile.blocks ? [...profile.blocks].sort((a, b) => a.blockOrder - b.blockOrder) : [];
    const totalClicks = stats ? Object.values(stats).reduce((sum, val) => sum + val, 0) : 0;
    const totalViews = profile?.views || 0;
    const showStats = profile?.showStats !== false;

    return (
      <>
        <title>{profile.seoTitle || profile.displayName}</title>
        <meta name="description" content={profile.seoDescription || profile.description} />
        <meta property="og:title" content={profile.seoTitle || profile.displayName} />
        <meta property="og:description" content={profile.seoDescription || profile.description} />
        <meta property="og:image" content={profile.socialImage || profile.avatarUrl} />
        <meta property="og:url" content={`${window.location.origin}/${profile.slug}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={profile.seoTitle || profile.displayName} />
        <meta name="twitter:description" content={profile.seoDescription || profile.description} />
        <meta name="twitter:image" content={profile.socialImage || profile.avatarUrl} />
    
        <div className={`relative ${pageClassName}`} style={pageStyle}>
                <FloatingParticles />
                
                {!backgroundValue.startsWith('http') && !backgroundValue.startsWith('linear-gradient') && (
                    <>
                        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </>
                )}
                
                <div className="relative z-10 w-full max-w-2xl mx-auto">
                    <motion.div
                        className="text-center mb-12 mt-8"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    >
                        <motion.div
                            className="relative inline-block mb-6"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-2xl opacity-75 animate-pulse"></div>
                            <div className="relative">
                                <img
                                    src={profile.avatarUrl || 'https://via.placeholder.com/150'}
                                    alt={profile.displayName}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl relative z-10"
                                />
                                <motion.div
                                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-full shadow-lg z-20"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <HiSparkles className="text-white text-xl" />
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl font-black mb-4 tracking-tight"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{textShadow: '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)'}}
                        >
                            {profile.fontColor && profile.fontColor.toUpperCase() !== '#FFFFFF' ? (
                                <span style={{ color: profile.fontColor }}>
                                    {profile.displayName}
                                </span>
                            ) : (
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                    {profile.displayName}
                                </span>
                            )}
                        </motion.h1>

                        {profile.description && (
                            <motion.p
                                className="text-lg sm:text-xl max-w-2xl mx-auto font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{ 
                                    color: profile.fontColor || '#FFFFFF',
                                    opacity: 0.9 
                                }}
                            >
                                {profile.description}
                            </motion.p>
                        )}

                        <AnimatePresence>
                            {showStats && (totalViews > 0 || totalClicks > 0) && (
                                <motion.div
                                    className="mt-8 flex flex-wrap items-center justify-center gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {totalViews > 0 && (
                                        <motion.div
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className="group relative"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                                            <div className="relative flex items-center gap-3 px-6 py-3 bg-blue-500/30 backdrop-blur-xl rounded-2xl border border-white/20">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <FaEye className="text-white text-xl" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">Lượt xem</div>
                                                    <div className="text-2xl font-black text-white">{totalViews.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    {totalClicks > 0 && (
                                        <motion.div
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className="group relative"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                                            <div className="relative flex items-center gap-3 px-6 py-3 bg-purple-500/30 backdrop-blur-xl rounded-2xl border border-white/20">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    <BiTrendingUp className="text-white text-xl" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">Lượt nhấp</div>
                                                    <div className="text-2xl font-black text-white">{totalClicks.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <motion.div
                        className="w-full space-y-4 mb-12"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.5
                                }
                            }
                        }}
                    >
                        {sortedBlocks.length > 0 ? (
                            sortedBlocks.map((block) => (
                                <motion.div
                                    key={block.id}
                                    variants={{
                                        hidden: { y: 30, opacity: 0 },
                                        visible: { y: 0, opacity: 1 }
                                    }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                >
                                    <BlockRenderer
                                        block={block}
                                        customStyles={{ 
                                            buttonStyle: profile.buttonStyle, 
                                            buttonShape: profile.buttonShape 
                                        }}
                                        showClickCount={showStats}
                                        clickCount={stats?.[block.id] || 0}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                variants={{
                                    hidden: { y: 30, opacity: 0 },
                                    visible: { y: 0, opacity: 1 }
                                }}
                                className="text-center py-12"
                            >
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                    <p className="text-white/70 text-lg">
                                        Chưa có khối nào được thêm vào
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    <Guestbook />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-16 mb-8"
                    >
                        <div className="text-center space-y-4">
                            <motion.a
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/20 text-white font-semibold transition-all duration-300 group"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/>
                                    </svg>
                                </div>
                                <span>Tạo Bio Link miễn phí</span>
                                <motion.svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </motion.svg>
                            </motion.a>
                            
                            <div className="text-xs text-white/40">
                                <p className="flex items-center justify-center gap-2">
                                    Powered by <span className="font-semibold">BioLink</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}