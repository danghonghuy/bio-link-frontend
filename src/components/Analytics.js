import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BiShow, BiMouse } from 'react-icons/bi';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center space-x-4">
        <div className={`text-3xl p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default function Analytics({ profile }) {
    const { currentUser } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            setError(null);
            axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/analytics/${currentUser.uid}`)
                .then(response => {
                    setAnalytics(response.data);
                })
                .catch(err => {
                    console.error("Không thể tải dữ liệu phân tích", err);
                    setError("Đã xảy ra lỗi khi tải dữ liệu phân tích. Vui lòng thử lại.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [currentUser]);

    if (isLoading) {
        return <div className="bg-white rounded-2xl shadow-sm text-center p-10"><p>Đang tải dữ liệu phân tích...</p></div>;
    }
    
    if (error) {
        return <div className="bg-white rounded-2xl shadow-sm text-center p-10"><p className="text-red-500">{error}</p></div>;
    }
    
    if (!analytics) {
        return <div className="bg-white rounded-2xl shadow-sm text-center p-10"><p>Không có dữ liệu để hiển thị.</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Tổng lượt xem trang" value={analytics.totalViews ?? 0} icon={<BiShow />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Tổng lượt nhấp chuột" value={analytics.totalClicks ?? 0} icon={<BiMouse />} color="bg-green-100 text-green-600" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Hoạt động trong 7 ngày qua</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="clicks" name="Lượt nhấp" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
             <div className="bg-white p-6 rounded-2xl shadow-sm">
                 <h3 className="font-bold text-lg mb-4 text-gray-800">Các liên kết hàng đầu</h3>
                 <div className="space-y-3">
                    {analytics.topLinks?.length > 0 ? analytics.topLinks.map((link, index) => (
                         <div key={link.blockId || index} className="flex items-center text-sm">
                            <span className="font-bold text-gray-600 mr-4 w-4">{index + 1}.</span>
                             <div className="flex-grow bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                 <span className="font-medium text-gray-800 truncate pr-4">{link.title || link.url}</span>
                                 <span className="font-bold text-blue-600 flex-shrink-0">{link.count} clicks</span>
                             </div>
                         </div>
                     )) : <p className="text-gray-500 text-center py-4">Chưa có liên kết nào được nhấp.</p>}
                 </div>
             </div>
        </div>
    );
}