import React from 'react';
import axios from 'axios';
import { getIconForUrl } from '../utils/icons';

export default function BlockRenderer({ block }) {
    const { type, data: jsonData } = block;
    const data = JSON.parse(jsonData);

    const handleClick = async (e) => {
        e.preventDefault(); 
        try {
            axios.post(`${process.env.REACT_APP_API_URL}/api/blocks/${block.id}/click`);
        } catch (err) {
            console.error("Không thể ghi nhận lượt click:", err);
        } finally {
            setTimeout(() => {
                window.open(data.url, '_blank', 'noopener,noreferrer');
            }, 100); 
        }
    };

    switch (type) {
        case 'link':
            return (
                <a 
                    href={data.url}
                    onClick={handleClick}
                    onAuxClick={handleClick}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-4 mb-4 rounded-xl text-white font-semibold shadow-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                    <span className="text-xl text-white/80 flex-shrink-0 mr-4">
                      {getIconForUrl(data.url)}
                    </span>
                    <span className="flex-grow text-center">{data.title}</span>
                </a>
            );

        default:
            return null;
    }
}