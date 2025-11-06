import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle, doSignOut } from '../firebase';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import { BiPencil } from 'react-icons/bi';
import { FaBolt } from 'react-icons/fa';

const handleImageUpload = async (file) => {
    const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData);
        return response.data.secure_url;
    } catch (error) {
        console.error("Lỗi tải ảnh lên Cloudinary:", error);
        return null;
    }
};

export default function HomePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            setIsLoadingProfile(true);
            axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/mine/${currentUser.uid}`)
                .then(response => { 
                    setProfile(response.data);
                })
                .catch(error => {
                    if (error.response && error.response.status === 404) {
                        const newProfile = {
                            displayName: currentUser.displayName,
                            avatarUrl: currentUser.photoURL,
                            userId: currentUser.uid,
                            blocks: [],
                        };
                        setProfile(newProfile); 
                    }
                })
                .finally(() => { setIsLoadingProfile(false); });
        } else {
            setProfile(null);
            setIsLoadingProfile(false);
        }
    }, [currentUser]);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(prev => ({...prev, ...updatedProfile}));
    };
    
    const onFileChange = async (event) => {
        const file = event.target.files[0];
        if (file && profile) {
            setIsUploading(true);
            const imageUrl = await handleImageUpload(file);
            if (imageUrl) {
                const updatedProfileData = { ...profile, avatarUrl: imageUrl };
                const { blocks, ...profileToSave } = updatedProfileData;
                
                try {
                    await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, profileToSave);
                    setProfile(updatedProfileData);
                } catch(err) {
                    alert('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
                }
            }
            setIsUploading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await doSignOut();
            navigate('/');
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };
  
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-800 flex items-center">
                    <FaBolt className="text-blue-500 mr-2" />
                    BioLink
                </h2>
                {currentUser && (
                    <div className="flex items-center bg-white shadow-lg rounded-full p-2">
                        <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current.click()}>
                            <img src={profile?.avatarUrl || currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-all duration-300">
                                {isUploading 
                                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    : <BiPencil className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                                }
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" disabled={isUploading}/>
                        <span className="mx-4 font-semibold text-gray-700 hidden sm:block">{profile?.displayName || currentUser.displayName}</span>
                        <button onClick={handleSignOut} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full">Đăng xuất</button>
                    </div>
                )}
            </header>
            
            <main className="container mx-auto max-w-7xl px-4 pt-24 pb-8">
                {currentUser
                    ? (isLoadingProfile ? <p className="text-center">Đang tải dữ liệu của bạn...</p> : <Dashboard profile={profile} onProfileUpdate={handleProfileUpdate} />)
                    : <LandingPage onSignIn={signInWithGoogle} />
                }
            </main>
        </div>
    );
}