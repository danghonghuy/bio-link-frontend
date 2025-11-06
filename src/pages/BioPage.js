import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import BlockRenderer from '../components/BlockRenderer';
import './BioPage.css';

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
        return <div className="loading-container"><h1 className="text-xl font-semibold">Đang tải...</h1></div>;
    }

    if (error) {
        return <div className="error-container"><h1>{error}</h1></div>;
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <img 
                        src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                        alt="Avatar" 
                        className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover"
                    />
                    <h1 className="text-3xl font-bold mt-4 text-gray-800">{profile.displayName}</h1>
                    <p className="text-gray-600 mt-2 px-4">{profile.description}</p>
                </div>
                
                <div className="w-full">
                    {profile.blocks && profile.blocks.map(block => (
                        <BlockRenderer key={block.id} block={block} />
                    ))}
                </div>

                 <a 
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center mt-10 text-xs text-gray-400 hover:text-gray-600"
                >
                   Tạo Bio Link miễn phí
                </a>
            </div>
        </div>
    );
}