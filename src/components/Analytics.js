import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { format, parseISO, isValid } from 'date-fns';
import { BiShow, BiMouse, BiAnalyse, BiGlobe, BiLink, BiChart, BiBarChartAlt2 } from 'react-icons/bi';
import { FaExclamationTriangle } from 'react-icons/fa';

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num;
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex items-center space-x-4">
        <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const DateRangePicker = ({ currentRange, onRangeChange }) => {
    const ranges = [ { key: 'today', label: 'Hôm nay' }, { key: 'yesterday', label: 'Hôm qua' }, { key: '7d', label: '7 ngày qua' }, { key: '30d', label: '30 ngày qua' }, { key: 'all', label: 'Toàn thời gian' }, ];
    return (
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-sm p-1 flex items-center space-x-1 flex-wrap">
            {ranges.map(range => (
                <button
                    key={range.key}
                    onClick={() => onRangeChange(range.key)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                        currentRange === range.key ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
};

const GeoChart = memo(({ data }) => {
    const [tooltipContent, setTooltipContent] = useState('');
    const colorScale = scaleLinear().domain([0, Math.max(...data.map(d => d.count))]).range(["#cce5ff", "#003d99"]);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-full" data-tip="">
            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100 flex items-center"><BiGlobe className="mr-2"/> Phân bố địa lý</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Lượt xem trang theo quốc gia.</p>
            <div style={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={350}>
                    <ComposableMap projectionConfig={{ scale: 120 }}>
                        <ZoomableGroup center={[0, 20]}>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map(geo => {
                                        const d = data.find(s => s.country === geo.properties.ISO_A2);
                                        return <Geography key={geo.rsmKey} geography={geo} fill={d ? colorScale(d.count) : "#E9EEF4"} stroke="#FFF" strokeWidth={0.5} onMouseEnter={() => setTooltipContent(`${geo.properties.NAME} — ${d ? formatNumber(d.count) : 0} lượt xem`)} onMouseLeave={() => setTooltipContent('')} style={{ hover: { fill: "#3b82f6", outline: "none" }, pressed: { fill: "#2563eb", outline: "none" } }} />;
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </ResponsiveContainer>
                {tooltipContent && <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 rounded text-xs pointer-events-none">{tooltipContent}</div>}
            </div>
        </div>
    );
});

const ReferrersList = ({ data }) => {
    const getFavicon = (source) => `https://www.google.com/s2/favicons?domain=${source}&sz=32`;
    const totalReferrers = data.reduce((sum, item) => sum + item.count, 0);
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm h-full">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100 flex items-center"><BiLink className="mr-2"/> Nguồn truy cập</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {data.map((ref, index) => {
                    const percentage = totalReferrers > 0 ? (ref.count / totalReferrers) * 100 : 0;
                    return (
                        <div key={index}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <div className="flex items-center gap-2 min-w-0"><img src={getFavicon(ref.source)} alt={ref.source} className="w-4 h-4 flex-shrink-0" /><p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{ref.source}</p></div>
                                <p className="font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">{formatNumber(ref.count)}</p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TopLinks = ({ data }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100 flex items-center"><BiBarChartAlt2 className="mr-2"/> Các liên kết hiệu quả nhất</h3>
            <div className="space-y-4">
                {data.map((link, index) => {
                    const maxClicks = data.length > 0 ? data[0].count : 0;
                    const percentage = maxClicks > 0 ? (link.count / maxClicks) * 100 : 0;
                    return (
                        <div key={link.blockId || index}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <p className="font-semibold text-gray-700 dark:text-gray-300 truncate pr-4">{index + 1}. {link.title || link.url}</p>
                                <p className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">{formatNumber(link.count)} nhấp</p>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AnalyticsSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div><div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div><div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div></div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div></div>
    </div>
);

export default function Analytics({ profile }) {
    const { currentUser } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        if (currentUser) {
            setIsLoading(true);
            setError(null);
            axios.get(`${process.env.REACT_APP_API_URL}/api/profiles/analytics/${currentUser.uid}?range=${dateRange}`)
                .then(response => {
                    const processedData = {
                        ...response.data,
                        dailyStats: response.data.dailyStats.map(stat => {
                            const parsedDate = parseISO(stat.date);
                            return { ...stat, date: isValid(parsedDate) ? format(parsedDate, 'dd-MM') : 'Ngày Lỗi' };
                        }),
                    };
                    setAnalytics(processedData);
                })
                .catch(err => { console.error("Không thể tải dữ liệu phân tích", err); setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."); })
                .finally(() => setIsLoading(false));
        }
    }, [currentUser, dateRange]);

    if (isLoading) return <AnalyticsSkeleton />;

    if (error) return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-center p-10 flex flex-col items-center gap-4">
            <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-4xl" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tải dữ liệu thất bại</h3>
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
        </div>
    );
    
    if (!analytics || analytics.totalViews === 0) return (
        <div className="space-y-8">
             <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tổng quan Phân tích</h2>
                <DateRangePicker currentRange={dateRange} onRangeChange={setDateRange} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-center p-10 flex flex-col items-center gap-4">
                <BiChart className="text-gray-400 dark:text-gray-500 text-5xl" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chưa có dữ liệu phân tích</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hãy chia sẻ trang BioLink của bạn để bắt đầu thu thập dữ liệu.</p>
            </div>
        </div>
    );

    const ctr = analytics.totalViews > 0 ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(2) + '%' : '0%';

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tổng quan Phân tích</h2>
                <DateRangePicker currentRange={dateRange} onRangeChange={setDateRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Tổng lượt xem" value={formatNumber(analytics.totalViews)} icon={<BiShow />} color="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" />
                <StatCard title="Tổng lượt nhấp" value={formatNumber(analytics.totalClicks)} icon={<BiMouse />} color="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" />
                <StatCard title="Tỷ lệ nhấp (CTR)" value={ctr} icon={<BiAnalyse />} color="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Biểu đồ hoạt động</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="date" tick={{ fill: '#6B7280' }} className="dark:text-gray-400"/>
                        <YAxis allowDecimals={false} tickFormatter={formatNumber} tick={{ fill: '#6B7280' }} className="dark:text-gray-400"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.75rem' }} labelStyle={{ color: '#F9FAFB' }} itemStyle={{ color: '#9CA3AF' }} />
                        <Legend wrapperStyle={{ color: '#4B5563' }}/>
                        <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} dot={false}/>
                        <Line type="monotone" dataKey="clicks" name="Lượt nhấp" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 8 }} dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            {analytics.topLinks?.length > 0 && <TopLinks data={analytics.topLinks} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {analytics.geo?.length > 0 && <GeoChart data={analytics.geo} />}
                {analytics.referrers?.length > 0 && <ReferrersList data={analytics.referrers} />}
            </div>
        </div>
    );
}