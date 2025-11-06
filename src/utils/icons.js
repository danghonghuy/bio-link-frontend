import { FaFacebook, FaYoutube, FaTiktok, FaGithub, FaLink, FaInstagram, FaTwitter } from 'react-icons/fa';

// Hàm này sẽ là trái tim của việc nhận diện icon
export const getIconForUrl = (url) => {
    if (!url) return <FaLink />;

    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('facebook.com')) return <FaFacebook />;
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return <FaYoutube />;
    if (lowerUrl.includes('tiktok.com')) return <FaTiktok />;
    if (lowerUrl.includes('github.com')) return <FaGithub />;
    if (lowerUrl.includes('instagram.com')) return <FaInstagram />;
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return <FaTwitter />;
    
    // Mặc định trả về icon link chung
    return <FaLink />;
};