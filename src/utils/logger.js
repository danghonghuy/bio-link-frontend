// Tạo một file mới ví dụ: src/utils/logger.js

export const logInfo = (component, message, data) => {
    console.log(`%c[${component}]`, 'color: blue; font-weight: bold;', message, data || '');
}

export const logError = (component, message, error) => {
    console.error(`%c[${component} Error]`, 'color: white; background: red; font-weight: bold; padding: 2px 4px; border-radius: 4px;', message, error);
}

// Cách dùng trong component
// import { logError } from '../utils/logger';
// logError('BioPage', 'Lỗi khi tải profile:', err);