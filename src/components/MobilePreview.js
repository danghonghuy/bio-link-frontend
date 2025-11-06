import React from 'react';
import BlockRenderer from './BlockRenderer';
import { motion } from 'framer-motion';

export default function MobilePreview({ profile, blocks }) {
    
    const backgroundValue = profile?.background || 'dynamic-default-bg';
    let pageStyle = {};
    let pageClassName = 'w-full h-full overflow-y-auto p-4';

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

    const sortedBlocks = blocks ? [...blocks].sort((a, b) => a.blockOrder - b.blockOrder) : [];

    return (
        <div className="w-[350px] h-[700px] mx-auto bg-gray-800 rounded-[40px] border-[10px] border-gray-800 shadow-2xl overflow-hidden">
            <div className={pageClassName} style={pageStyle}>
                <div className="w-full max-w-lg mx-auto flex flex-col items-center">
                    {/* Header Info */}
                    <div className={`text-center mb-10 w-full ${profile?.font || 'font-inter'}`}>
                         <img 
                            src={profile.avatarUrl || 'https://via.placeholder.com/150'} 
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full mx-auto shadow-2xl object-cover border-4 border-white/30"
                        />
                        <h1 
                            className="text-2xl font-bold mt-4 tracking-tight text-white" 
                            style={{textShadow: '0 0 10px rgba(0,0,0,0.5)'}}
                        >
                            {profile.displayName}
                        </h1>
                        <p className="mt-1 text-sm text-white/80">{profile.description}</p>
                    </div>

                    {/* Blocks */}
                    <div className="w-full space-y-3">
                        {sortedBlocks.map(block => (
                            <div key={block.id}>
                                <BlockRenderer block={block} customStyles={{ buttonStyle: profile?.buttonStyle }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}