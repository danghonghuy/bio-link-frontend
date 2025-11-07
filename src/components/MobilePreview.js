import React from 'react';
import BlockRenderer from './BlockRenderer';
import { motion } from 'framer-motion';

export default function MobilePreview({ profile, blocks }) {
  const backgroundValue = profile?.background || 'dynamic-default-bg';
  let pageStyle = {};
  let pageClassName = 'relative w-full h-full overflow-y-auto p-6 backdrop-blur-md';

  if (backgroundValue.startsWith('http')) {
    const opacity = (profile?.backgroundImageOpacity ?? 40) / 100;
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
    <motion.div
      className="relative w-[380px] h-[760px] mx-auto bg-gradient-to-b from-gray-900 to-gray-950 
                 rounded-[60px] border-[8px] border-gray-700 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden"
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* -- Metal Frame Shine -- */}
      <div className="absolute inset-0 rounded-[52px] border border-white/10 bg-gradient-to-tr from-gray-800/30 to-gray-700/10 pointer-events-none"></div>

      {/* -- Notch + Camera Simulation -- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-black/80 rounded-full flex items-center justify-center z-20">
        <div className="w-3 h-3 bg-gray-400/80 rounded-full mr-2"></div>
        <div className="w-6 h-2 bg-gray-700/60 rounded-full"></div>
      </div>

      {/* -- Inner Screen -- */}
      <div className={pageClassName} style={pageStyle}>
        {/* Light Reflection Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative w-full max-w-md mx-auto flex flex-col items-center text-center">
          {/* Profile Section */}
          <motion.div
            className={`mb-10 w-full ${profile?.font || 'font-inter'}`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.img
              src={profile.avatarUrl || 'https://via.placeholder.com/150'}
              alt="Avatar"
              className="w-28 h-28 rounded-full mx-auto shadow-xl object-cover border-[5px] border-white/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <h1
              className="text-2xl font-semibold mt-4 tracking-tight drop-shadow-lg"
              style={{
                color: profile.fontColor || '#FFFFFF',
              }}
            >
              {profile.displayName}
            </h1>
            <p
              className="mt-1 text-sm opacity-90"
              style={{
                color: profile.fontColor || '#FFFFFF',
              }}
            >
              {profile.description}
            </p>
          </motion.div>

          {/* Blocks */}
          <motion.div
            className="w-full space-y-4 pb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {sortedBlocks.map((block) => (
              <motion.div key={block.id} whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 200 }}>
                <BlockRenderer
                  block={block}
                  customStyles={{
                    buttonStyle: profile?.buttonStyle,
                    buttonShape: profile?.buttonShape,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Gesture Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-white/40 rounded-full" />
    </motion.div>
  );
}
