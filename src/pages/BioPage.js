import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import BlockRenderer from '../components/BlockRenderer';

export default function BioPage() {
    const { slug } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/${slug}`);
                setProfile(response.data);
            } catch (err) {
                setError('Không tìm thấy profile này.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center dynamic-default-bg">
                <h1 className="text-xl font-semibold text-white">Đang tải...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-red-100">
                 <h1 className="text-xl font-semibold text-red-600 bg-white/80 p-4 rounded-lg shadow-md">{error}</h1>
            </div>
        );
    }
    
    const backgroundValue = profile?.background || 'dynamic-default-bg';
    let pageStyle = {};
    let pageClassName = 'flex flex-col items-center min-h-screen w-full p-4 sm:p-8';

    if (backgroundValue.startsWith('http')) {
        const opacity = (profile?.backgroundImageOpacity ?? 50) / 100;
        const overlay = `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity}))`;

        pageStyle = { 
            backgroundImage: `${overlay}, url(${backgroundValue})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    } else if (backgroundValue.startsWith('linear-gradient')) {
        pageStyle = { background: backgroundValue };
    } else {
        pageClassName += ` ${backgroundValue}`;
    }
    
    const sortedBlocks = profile.blocks ? [...profile.blocks].sort((a, b) => a.blockOrder - b.blockOrder) : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className={pageClassName} style={pageStyle}>
            <div className="w-full max-w-lg mx-auto">
                <motion.div 
                    className="text-center mb-10"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                >
                    <img 
                        src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-28 h-28 rounded-full mx-auto shadow-2xl object-cover border-4 border-white/30"
                    />
                    <h1 
                        className="text-4xl font-extrabold mt-5 tracking-tight text-white" 
                        style={{textShadow: '0 0 15px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)'}}
                    >
                        {profile.displayName}
                    </h1>
                    <p className="mt-2 text-white/80">{profile.description}</p>
                </motion.div>
                
                <motion.div 
                    className="w-full space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {sortedBlocks.map(block => (
                        <motion.div key={block.id} variants={itemVariants}>
                            <BlockRenderer block={block} />
                        </motion.div>
                    ))}
                </motion.div>
                
                 <a 
                    href="https://bio.dhh.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center mt-12 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                   Tạo Bio Link miễn phí
                </a>
            </div>
        </div>
    );
}