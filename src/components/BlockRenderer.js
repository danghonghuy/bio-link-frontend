import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { getIconForUrl } from '../utils/icons';
import { FaYoutube, FaSpotify, FaSoundcloud, FaTiktok } from 'react-icons/fa';
import { BiBarChart } from 'react-icons/bi';

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

const TikTokEmbed = ({ url }) => { 
    const ref = useRef(null); 
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

export default function BlockRenderer({ block, customStyles, showClickCount = false, clickCount = 0 }) {
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
            <div className="flex items-center justify-center gap-x-2 mb-2"> 
                {icon} 
                <h3 className="text-lg font-semibold text-white">{titleText}</h3> 
            </div> 
        ) 
    };

    const ClickCounter = () => {
        if (!showClickCount || type !== 'link' || clickCount === 0) return null;
        
        return (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white/90 z-20">
                <BiBarChart className="text-white/80" />
                <span>{clickCount.toLocaleString()}</span>
            </div>
        );
    };

    switch (type) {
        case 'link':
            const linkStyle = {};
            if (data.thumbnailUrl) {
                // Thêm lớp phủ màu đen mờ 40% để chữ và icon nổi bật hơn
                linkStyle.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${data.thumbnailUrl})`;
                linkStyle.backgroundSize = 'cover';
                linkStyle.backgroundPosition = 'center';
            }
            
            return (
                <a 
                    href={data.url} 
                    onClick={handleClick} 
                    onAuxClick={handleClick} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group relative flex items-center w-full p-4 text-white font-semibold shadow-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${!data.thumbnailUrl ? 'bg-white/10 hover:bg-white/20' : ''} ${customStyles?.buttonStyle || 'rounded-xl'}`}
                    style={linkStyle}
                >
                    <ClickCounter />
                    <span className="text-xl text-white/80 flex-shrink-0 mr-4 transition-transform group-hover:scale-110 z-10">
                        {getIconForUrl(data.url)}
                    </span>
                    <span className="flex-grow text-center z-10">{data.title}</span>
                </a>
            );
            
        case 'header':
            return (
                <h2 className="text-xl font-bold text-center text-white/90 my-4 drop-shadow-sm">
                    {data.text}
                </h2>
            );
            
        case 'image':
            return (
                <div className='w-full'>
                    <img 
                        src={data.url} 
                        alt={data.title || 'Hình ảnh'} 
                        className='w-full h-auto rounded-xl object-cover shadow-lg' 
                    />
                    {data.title && (
                        <p className='text-center text-sm text-white/80 mt-2'>{data.title}</p>
                    )}
                </div>
            );
            
        case 'youtube': { 
            const videoId = getYouTubeId(data.url); 
            if (!videoId) return (
                <p className="text-center text-red-100 p-2 bg-red-500/30 rounded-lg">
                    Link YouTube không hợp lệ.
                </p>
            ); 
            
            return ( 
                <div className="w-full"> 
                    <Title 
                        icon={<FaYoutube className="text-red-500 text-2xl" />} 
                        defaultTitle="Video YouTube"
                    /> 
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg"> 
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${videoId}`} 
                            title={data.title || "YouTube video player"} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe> 
                    </div> 
                </div> 
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
                <div className="w-full"> 
                    <Title 
                        icon={<FaSpotify className="text-green-500 text-2xl" />} 
                        defaultTitle="Nhạc trên Spotify" 
                    /> 
                    <div className="w-full rounded-xl overflow-hidden shadow-lg"> 
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
            ); 
        }
        
        case 'soundcloud': { 
            if(!data.url) return null; 
            
            return ( 
                <div className="w-full"> 
                    <Title 
                        icon={<FaSoundcloud className="text-orange-500 text-2xl" />} 
                        defaultTitle="Nhạc trên SoundCloud" 
                    /> 
                    <div className="w-full [&>div>iframe]:rounded-xl shadow-lg"> 
                        <SoundCloudEmbed url={data.url} /> 
                    </div> 
                </div> 
            ); 
        }
        
        case 'tiktok': { 
            if (!data.url) return null; 
            
            return ( 
                <div className="w-full"> 
                    <Title 
                        icon={<FaTiktok className="text-white text-xl" />} 
                        defaultTitle="Video TikTok"
                    /> 
                    <TikTokEmbed url={data.url} /> 
                </div> 
            ); 
        }
        
        default:
            return null;
    }
}