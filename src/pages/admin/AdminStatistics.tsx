import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAdminStats, getDailyFortuneStats, getHourlyFortuneDistribution } from '@/lib/admin';

const AdminStatistics = () => {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    const adminStats = getAdminStats();
    setStats(adminStats);
    
    const daily = getDailyFortuneStats(30);
    setDailyData(daily);
    
    const hourly = getHourlyFortuneDistribution();
    setHourlyData(hourly);
    
    setActivityData([
      { name: 'Aktif', value: adminStats.activeUsers, color: '#10B981' },
      { name: 'Pasif', value: adminStats.totalUsers - adminStats.activeUsers, color: '#EF4444' }
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">İstatistikler</h1>
        <p className="text-gray-600">Detaylı analiz ve raporlar</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Son 30 Günlük Fal Trendi</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#6B46C1" strokeWidth={2} name="Fal Sayısı" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Saatlik Fal Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" name="Fal Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Kullanıcı Aktivitesi</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium mb-2">Ortalama Fal / Kullanıcı</h3>
          <p className="text-3xl font-bold">
            {stats.totalUsers > 0 ? (stats.totalFortunes / stats.totalUsers).toFixed(1) : 0}
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium mb-2">Kullanıcı Büyüme</h3>
          <p className="text-3xl font-bold">+{stats.userGrowth}%</p>
          <p className="text-xs mt-1">Bu ay</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <h3 className="text-sm font-medium mb-2">Fal Artış Oranı</h3>
          <p className="text-3xl font-bold">+{stats.fortuneGrowth}%</p>
          <p className="text-xs mt-1">Bu ay</p>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
