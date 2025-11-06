import React from 'react';
import {
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaGithub,
  FaLink,
  FaInstagram,
  FaTwitter,
  FaSpotify,
  FaSoundcloud,
  FaTelegramPlane,
  FaWhatsapp,
  FaDiscord,
} from 'react-icons/fa';
import { 
  SiZalo,
  SiLeagueoflegends,
} from 'react-icons/si';
import { IoGameController } from 'react-icons/io5';

export const getIconForUrl = (url) => {
  if (!url) {
    return <FaLink />;
  }

  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.me')) return <FaFacebook />;
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <FaYoutube />;
  if (lowerUrl.includes('tiktok.com')) return <FaTiktok />;
  if (lowerUrl.includes('github.com')) return <FaGithub />;
  if (lowerUrl.includes('instagram.com')) return <FaInstagram />;
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <FaTwitter />;
  if (lowerUrl.includes('spotify.com')) return <FaSpotify />;
  if (lowerUrl.includes('soundcloud.com')) return <FaSoundcloud />;
  if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.me')) return <FaTelegramPlane />;
  if (lowerUrl.includes('zalo.me')) return <SiZalo />;
  if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com')) return <FaWhatsapp />;
  
  if (lowerUrl.includes('discord.gg') || lowerUrl.includes('discord.com')) return <FaDiscord />;
  if (lowerUrl.includes('leagueoflegends.com') || lowerUrl.includes('riotgames.com')) return <SiLeagueoflegends />;
  if (lowerUrl.includes('genshin.hoyoverse.com') || lowerUrl.includes('honkaiimpact3.hoyoverse.com') || lowerUrl.includes('hsr.hoyoverse.com') || lowerUrl.includes('hoyolab.com')) return <IoGameController />;

  return <FaLink />;
};