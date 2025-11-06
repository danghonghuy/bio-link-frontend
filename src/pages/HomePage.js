import React, { useState } from 'react';
import axios from 'axios'; // Import công cụ gọi API vừa cài
import '../App.css'; 

export default function HomePage() {
  // --- Tạo các state để lưu dữ liệu từ form ---
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  
  // --- State cho kết quả và trạng thái loading ---
  const [isLoading, setIsLoading] = useState(false);
  const [resultLink, setResultLink] = useState(''); // Link bio sau khi tạo thành công

  // Hàm được gọi khi người dùng bấm nút "Tạo Bio"
  const handleCreateBio = async () => {
    if (!displayName.trim()) {
      alert('Tên hiển thị là bắt buộc!');
      return;
    }

    setIsLoading(true);
    setResultLink('');

    // Gom tất cả dữ liệu thành một đối tượng JSON
    const profileData = {
      displayName,
      description,
      avatarUrl,
      facebookLink,
      youtubeLink,
      tiktokLink,
      githubLink
    };

    try {
      // Gửi request POST đến backend sử dụng biến môi trường
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/profiles`, profileData);

      // Lấy slug từ kết quả backend trả về
      const slug = response.data.slug;
      
      // Tạo link đầy đủ để hiển thị cho người dùng
      const fullLink = `${window.location.origin}/${slug}`;
      setResultLink(fullLink);

    } catch (error) {
      console.error("Lỗi khi tạo bio:", error);
      alert('Đã xảy ra lỗi. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Tạo Bio Link của bạn</h1>
        <p>Tạo một trang cá nhân đơn giản để chia sẻ tất cả các liên kết của bạn.</p>

        <input type="text" placeholder="Tên hiển thị của bạn *" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input type="text" placeholder="Link ảnh đại diện (avatar)..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
        <textarea placeholder="Mô tả ngắn về bạn..." value={description} onChange={(e) => setDescription(e.target.value)} />

        <hr />
        <h3>Liên kết Mạng xã hội</h3>
        <input type="text" placeholder="Link Facebook..." value={facebookLink} onChange={(e) => setFacebookLink(e.target.value)} />
        <input type="text" placeholder="Link YouTube..." value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
        <input type="text" placeholder="Link TikTok..." value={tiktokLink} onChange={(e) => setTiktokLink(e.target.value)} />
        <input type="text" placeholder="Link GitHub..." value={githubLink} onChange={(e) => setGithubLink(e.target.value)} />

        <button onClick={handleCreateBio} disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : '🚀 Tạo Bio của tôi!'}
        </button>

        {/* Khu vực hiển thị kết quả */}
        {resultLink && (
          <div className="result-container">
            <h3>Tạo thành công!</h3>
            <p>Link Bio của bạn là:</p>
            <div className='link-box'>
              <a href={resultLink} target="_blank" rel="noopener noreferrer">{resultLink}</a>
              <button onClick={() => navigator.clipboard.writeText(resultLink)}>Sao chép</button>
            </div>
            <p className='note'>(Lưu ý: Chức năng xem link sẽ được làm ở bước tiếp theo)</p>
          </div>
        )}
      </div>
    </div>
  );
}