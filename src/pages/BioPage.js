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
        return <div className="min-h-screen flex items-center justify-center"><h1 className="text-xl font-semibold text-white">Đang tải...</h1></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center"><h1 className="text-xl font-semibold text-white bg-red-500 p-4 rounded-lg">{error}</h1></div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.2 }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 text-white">
            <div className="w-full max-w-2xl mx-auto">
                <motion.div 
                    className="text-center mb-10"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                >
                    <img 
                        src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-28 h-28 rounded-full mx-auto shadow-2xl object-cover border-4 border-white/50"
                    />
                    <h1 className="text-4xl font-bold mt-5 tracking-tight drop-shadow-md">{profile.displayName}</h1>
                    <p className="mt-2 text-white/80 max-w-lg mx-auto">{profile.description}</p>
                </motion.div>
                
                <motion.div 
                    className="w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {profile.blocks && profile.blocks.map(block => (
                        <motion.div key={block.id} variants={itemVariants}>
                            <BlockRenderer block={block} />
                        </motion.div>
                    ))}
                </motion.div>

                 <a 
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center mt-10 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                   Tạo Bio Link miễn phí
                </a>
            </div>
        </div>
    );
}