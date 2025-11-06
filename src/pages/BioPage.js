import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import { BiBarChart, BiTrendingUp, BiLink } from 'react-icons/bi';
import { 
    FaEye, 
    FaFire, 
    FaYoutube, 
    FaSpotify, 
    FaSoundcloud, 
    FaTiktok,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaGithub,
    FaTelegramPlane,
    FaLinkedinIn,
    FaDiscord,
    FaWhatsapp,
    FaPinterest,
    FaSnapchatGhost,
    FaRedditAlien,
    FaTwitch
} from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { HiSparkles } from 'react-icons/hi';

// Import your original utilities
const getIconForUrl = (url) => {
    if (!url) return <BiLink className="text-2xl" />;
    
    // Social Media Platforms
    if (url.includes('facebook.com')) return <FaFacebookF className="text-2xl text-blue-600" />;
    if (url.includes('instagram.com')) return <FaInstagram className="text-2xl text-pink-600" />;
    if (url.includes('twitter.com') || url.includes('x.com')) return <FaTwitter className="text-2xl text-sky-500" />;
    if (url.includes('linkedin.com')) return <FaLinkedinIn className="text-2xl text-blue-700" />;
    if (url.includes('tiktok.com')) return <FaTiktok className="text-2xl text-white" />;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return <FaYoutube className="text-2xl text-red-600" />;
    
    // Messaging Apps
    if (url.includes('telegram') || url.includes('t.me')) return <FaTelegramPlane className="text-2xl text-sky-500" />;
    if (url.includes('zalo.me')) return <SiZalo className="text-2xl text-blue-600" />;
    if (url.includes('whatsapp.com') || url.includes('wa.me')) return <FaWhatsapp className="text-2xl text-green-500" />;
    if (url.includes('discord')) return <FaDiscord className="text-2xl text-indigo-600" />;
    
    // Developer Platforms
    if (url.includes('github.com')) return <FaGithub className="text-2xl text-gray-900" />;
    
    // Other Platforms
    if (url.includes('spotify.com')) return <FaSpotify className="text-2xl text-green-500" />;
    if (url.includes('soundcloud.com')) return <FaSoundcloud className="text-2xl text-orange-600" />;
    if (url.includes('pinterest.com')) return <FaPinterest className="text-2xl text-red-600" />;
    if (url.includes('snapchat.com')) return <FaSnapchatGhost className="text-2xl text-yellow-400" />;
    if (url.includes('reddit.com')) return <FaRedditAlien className="text-2xl text-orange-600" />;
    if (url.includes('twitch.tv')) return <FaTwitch className="text-2xl text-purple-600" />;
    
    return <BiLink className="text-2xl" />;
};

const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getSpotifyEmbedUrl = (url) => {
    try {
        const urlObject = new URL(url);
        if (urlObject.hostname === 'open.spotify.com') {
            urlObject.pathname = '/embed' + urlObject.pathname;
            return urlObject.toString();
        }
    } catch (e) {
        return null;
    }
    return null;
};

// Floating particles background
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

// SoundCloud Embed Component
const SoundCloudEmbed = ({ url }) => {
    const [embedHtml, setEmbedHtml] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!url) return;
        let isMounted = true;
        
        const fetchEmbed = async () => {
            setError(null);
            try {
                const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error(`API returned status ${response.status}`);
                const data = await response.json();
                if (isMounted && data.html) {
                    setEmbedHtml(data.html);
                }
            } catch (error) {
                if (isMounted) setError("Không thể tải nội dung SoundCloud. Link có thể không hợp lệ.");
                console.error("SoundCloud oEmbed Error:", error);
            }
        };
        
        fetchEmbed();
        return () => { isMounted = false; };
    }, [url]);
    
    if (error) return <div className="text-center text-red-100 p-2 bg-red-500/30 rounded-lg">{error}</div>;
    if (embedHtml === null) return <div className="w-full h-44 bg-white/10 animate-pulse rounded-xl"></div>;
    return <div dangerouslySetInnerHTML={{ __html: embedHtml }} />;
};

// TikTok Embed Component
const TikTokEmbed = ({ url }) => {
    const ref = React.useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!url) return;
        if (ref.current) ref.current.innerHTML = "";
        
        const fetchAndRender = async () => {
            try {
                const response = await axios.get(`https://www.tiktok.com/oembed?url=${url}`, { timeout: 5000 });
                const data = response.data;
                
                if (ref.current && data.html) {
                    ref.current.innerHTML = data.html;
                    const scriptTag = ref.current.querySelector('script');
                    
                    if (scriptTag) {
                        const newScript = document.createElement('script');
                        newScript.src = scriptTag.src;
                        newScript.async = true;
                        newScript.onload = () => { setIsLoading(false); };
                        scriptTag.remove();
                        document.body.appendChild(newScript);
                        return () => {
                            if (document.body.contains(newScript)) document.body.removeChild(newScript);
                        };
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.error("TikTok embed error:", error);
                if(ref.current) ref.current.innerHTML = "<p class='text-center text-red-300 p-4'>Không thể tải video TikTok.</p>";
                setIsLoading(false);
            }
        };
        
        fetchAndRender();
    }, [url]);
    
    return (
        <div className="relative w-full max-w-[325px] sm:max-w-xs mx-auto">
            {isLoading && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl min-h-[500px]"></div>}
            <div ref={ref} className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}></div>
        </div>
    );
};

// Enhanced BlockRenderer
const BlockRenderer = ({ block, customStyles, showClickCount, clickCount }) => {
    const { type, data: jsonData } = block;
    const data = JSON.parse(jsonData);
    
    const handleClick = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/${block.id}/click`);
        } catch (err) {
            console.error('Error recording click:', err);
        } finally {
            setTimeout(() => {
                window.open(data.url, '_blank', 'noopener,noreferrer');
            }, 100);
        }
    };

    const Title = ({icon, defaultTitle}) => {
        const titleText = data.title || defaultTitle;
        if (!titleText) return null;
        
        return (
            <div className="flex items-center justify-center gap-x-2 mb-3">
                {icon}
                <h3 className="text-xl font-bold text-white">{titleText}</h3>
            </div>
        )
    };

    switch (type) {
        case 'link':
            const hasThumb = !!data.thumbnailUrl;
            
            return (
                <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                    
                    <a
                        href={data.url}
                        onClick={handleClick}
                        onAuxClick={handleClick}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative flex items-center w-full p-5 text-white font-semibold shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${
                            hasThumb ? 'min-h-[140px]' : 'bg-white/10 hover:bg-white/20'
                        } ${customStyles?.buttonStyle || 'rounded-2xl'} border border-white/20`}
                        style={hasThumb ? {
                            backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${data.thumbnailUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        } : {}}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        {showClickCount && clickCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-lg z-20"
                            >
                                <FaFire className="text-yellow-300" />
                                <span>{clickCount.toLocaleString()}</span>
                            </motion.div>
                        )}
                        
                        <div className="flex items-center w-full gap-4 z-10">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                                className="flex-shrink-0 bg-white p-3.5 rounded-xl shadow-lg backdrop-blur-sm"
                            >
                                {getIconForUrl(data.url)}
                            </motion.div>
                            
                            <div className="flex-grow">
                                <div className="text-lg font-bold tracking-wide">{data.title}</div>
                                {hasThumb && (
                                    <div className="text-xs text-white/70 mt-1">Tap to explore →</div>
                                )}
                            </div>
                            
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <HiSparkles className="text-2xl text-yellow-300" />
                            </div>
                        </div>
                    </a>
                </motion.div>
            );
            
        case 'header':
            return (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative my-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"></div>
                    <h2 className="relative text-2xl font-black text-center text-white py-4 tracking-wide">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                            {data.text}
                        </span>
                    </h2>
                </motion.div>
            );
            
        case 'image':
            return (
                <motion.div
                    className="w-full group"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-white/20">
                            <img
                                src={data.url}
                                alt={data.title || 'Hình ảnh'}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                    {data.title && (
                        <p className="text-center text-sm text-white/80 mt-3 font-medium">{data.title}</p>
                    )}
                </motion.div>
            );
            
        case 'youtube': {
            const videoId = getYouTubeId(data.url);
            if (!videoId) return (
                <p className="text-center text-red-100 p-2 bg-red-500/30 rounded-lg">
                    Link YouTube không hợp lệ.
                </p>
            );
            
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full group"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500"></div>
                        
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
                            <Title
                                icon={<FaYoutube className="text-red-500 text-2xl" />}
                                defaultTitle="Video YouTube"
                            />
                            
                            <div className="aspect-video">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title={data.title || "YouTube video"}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }
        
        case 'spotify': {
            const spotifyEmbedUrl = getSpotifyEmbedUrl(data.url);
            if (!spotifyEmbedUrl) return (
                <p className="text-center text-red-100 p-2 bg-red-500/30 rounded-lg">
                    Link Spotify không hợp lệ.
                </p>
            );
            
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full group"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500"></div>
                        
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 p-4">
                            <Title
                                icon={<FaSpotify className="text-green-500 text-2xl" />}
                                defaultTitle="Nhạc trên Spotify"
                            />
                            
                            <iframe
                                title={data.title || "Spotify Embed"}
                                style={{ borderRadius: '12px' }}
                                src={spotifyEmbedUrl}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </motion.div>
            );
        }
        
        case 'soundcloud': {
            if(!data.url) return null;
            
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full group"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-50 group-hover:opacity-100 blur transition duration-500"></div>
                        
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20 p-4">
                            <Title
                                icon={<FaSoundcloud className="text-orange-500 text-2xl" />}
                                defaultTitle="Nhạc trên SoundCloud"
                            />
                            
                            <div className="[&>div>iframe]:rounded-xl">
                                <SoundCloudEmbed url={data.url} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        }
        
        case 'tiktok': {
            if (!data.url) return null;
            
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                >
                    <Title
                        icon={<FaTiktok className="text-white text-xl" />}
                        defaultTitle="Video TikTok"
                    />
                    <TikTokEmbed url={data.url} />
                </motion.div>
            );
        }
        
        default:
            return null;
    }
};

// Main Component
export default function BioPage() {
    const { slug } = useParams();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfileAndRecordView = async () => {
            if (!slug) { setError('URL không hợp lệ.'); setIsLoading(false); return; }
            setIsLoading(true);
            try {
                const profilePromise = axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}`);
                
                axios.post(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}/view`).catch(err => {
                    console.error("Lỗi khi ghi nhận lượt xem:", err);
                });
                
                const profileResponse = await profilePromise;
                setProfile(profileResponse.data);
                
                if (profileResponse.data.userId) {
                    try {
                        const statsResponse = await axios.get(
                            `${process.env.REACT_APP_API_URL}/api/profiles/stats/${profileResponse.data.userId}`
                        );
                        setStats(statsResponse.data);
                    } catch (err) {
                        console.error("Lỗi khi tải thống kê:", err);
                    }
                }
            } catch (err) {
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
            
            <div className={`relative ${pageClassName}`} style={pageStyle}>
                <FloatingParticles />
                
                {/* Gradient orbs - only if using default background */}
                {!backgroundValue.startsWith('http') && !backgroundValue.startsWith('linear-gradient') && (
                    <>
                        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </>
                )}
                
                <div className="relative z-10 w-full max-w-2xl mx-auto">
                    {/* Profile Header */}
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
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                                {profile.displayName}
                            </span>
                        </motion.h1>

                        {profile.description && (
                            <motion.p
                                className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
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

                    {/* Blocks */}
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
                                        customStyles={{ buttonStyle: profile.buttonStyle }}
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

                    {/* Footer */}
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