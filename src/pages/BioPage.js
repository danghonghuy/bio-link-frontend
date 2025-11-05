import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Công cụ để đọc 'slug' từ URL
import axios from 'axios';
import './BioPage.css'; // File CSS riêng cho trang này

export default function BioPage() {
  const { slug } = useParams(); // Lấy slug từ URL, ví dụ: 'dang-hong-huy'
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect sẽ tự động chạy khi trang được tải
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://dhh-bio.onrender.com/api/profiles/${slug}`);
        setProfile(response.data);
        setError('');
      } catch (err) {
        setError('Không tìm thấy profile này!');
        console.error("Lỗi khi tải profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [slug]); // Nó sẽ chạy lại nếu slug trên URL thay đổi

  if (isLoading) {
    return <div className="loading-container"><h1>Đang tải...</h1></div>;
  }

  if (error) {
    return <div className="error-container"><h1>{error}</h1></div>;
  }

  return (
    <div className="bio-container">
      <img src={profile.avatarUrl || 'https://via.placeholder.com/150'} alt="Avatar" className="avatar" />
      <h1>{profile.displayName}</h1>
      <p className="description">{profile.description}</p>
      
      <div className="links-container">
        {profile.facebookLink && <a href={profile.facebookLink} target="_blank" rel="noopener noreferrer" className="link-button facebook">Facebook</a>}
        {profile.youtubeLink && <a href={profile.youtubeLink} target="_blank" rel="noopener noreferrer" className="link-button youtube">YouTube</a>}
        {profile.tiktokLink && <a href={profile.tiktokLink} target="_blank" rel="noopener noreferrer" className="link-button tiktok">TikTok</a>}
        {profile.githubLink && <a href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="link-button github">GitHub</a>}
      </div>
    </div>
  );
}