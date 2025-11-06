import React from 'react';
import axios from 'axios';
import { FaLink } from 'react-icons/fa';

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
                    onAuxClick={handleClick} // Cho cả chuột giữa
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-4 mb-4 bg-gray-200 text-gray-800 rounded-lg hover:scale-105 transform transition-transform duration-200 shadow-md"
                >
                    <FaLink className="mr-4 text-gray-600 flex-shrink-0" />
                    <span className="font-semibold flex-grow text-center">{data.title}</span>
                </a>
            );

        default:
            return null;
    }
}