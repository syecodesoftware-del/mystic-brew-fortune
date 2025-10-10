import { useEffect, useState } from 'react';
import { Users, Sparkles, Star, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { getAdminStats, getDailyFortuneStats, getAllFortunes } from '@/lib/admin';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFortunes: 0,
    todayFortunes: 0,
    activeUsers: 0,
    userGrowth: 0,
    fortuneGrowth: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentFortunes, setRecentFortunes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    console.log('Fetching admin dashboard data...');
    
    // LocalStorage'daki tüm anahtarları kontrol et
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    const users = localStorage.getItem('coffee_users');
    console.log('Users in localStorage:', users);
    
    const currentUser = localStorage.getItem('coffee_current_user');
    console.log('Current user:', currentUser);
    
    if (!users || users === '[]') {
      console.warn('No users found in localStorage!');
    }
    
    const adminStats = getAdminStats();
    console.log('Admin stats:', adminStats);
    setStats(adminStats);
    
    const dailyStats = getDailyFortuneStats(30);
    setChartData(dailyStats);
    
    const { fortunes } = getAllFortunes(1, 5);
    console.log('Recent fortunes:', fortunes);
    setRecentFortunes(fortunes);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: `+${stats.userGrowth}% bu ay`
    },
    {
      title: 'Toplam Fal',
      value: stats.totalFortunes,
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      change: `+${stats.fortuneGrowth}% bu ay`
    },
    {
      title: 'Bugünkü Fal',
      value: stats.todayFortunes,
      icon: Star,
      color: 'from-orange-500 to-red-500',
      change: 'Bugün'
    },
    {
      title: 'Aktif Kullanıcı',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      change: 'Son 7 gün'
    }
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! İşte genel bakış:</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-2">{card.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Son 30 Günün Fal İstatistikleri</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#6B46C1" strokeWidth={2} name="Fal Sayısı" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Fortunes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Son Fallar</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Önizleme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentFortunes.map((fortune) => (
                  <tr key={fortune.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{fortune.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fortune.timestamp).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {fortune.fortune.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Başarılı
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
          </>
        )}
    </div>
  );
};

export default AdminDashboard;
