import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BioPage from './pages/BioPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Nếu URL là '/' (trang chủ), thì hiển thị HomePage */}
        <Route path="/" element={<HomePage />} />
        
        {/* Nếu URL có dạng '/ten-gi-do', thì hiển thị BioPage */}
        {/* ':slug' là một tham số động */}
        <Route path="/:slug" element={<BioPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;