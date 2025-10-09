export interface Admin {
  id: string;
  email: string;
  password: string;
  role: 'admin';
  firstName: string;
  lastName: string;
  createdAt: string;
}

const ADMINS_KEY = 'coffee_admins';
const ADMIN_SESSION_KEY = 'coffee_admin_session';

// Admin hesabını initialize et
export const initializeAdmin = () => {
  const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]') as Admin[];
  
  if (admins.length === 0) {
    const defaultAdmin: Admin = {
      id: 'admin_master',
      email: 'admin@kahvefali.com',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(ADMINS_KEY, JSON.stringify([defaultAdmin]));
  }
};

// Admin login
export const adminLogin = (email: string, password: string) => {
  const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]') as Admin[];
  const admin = admins.find(a => a.email === email && a.password === password);
  
  if (!admin) {
    throw new Error('E-posta veya şifre hatalı');
  }
  
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
  return admin;
};

// Admin session kontrolü
export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem(ADMIN_SESSION_KEY) !== null;
};

// Mevcut admin
export const getCurrentAdmin = (): Admin | null => {
  const admin = localStorage.getItem(ADMIN_SESSION_KEY);
  return admin ? JSON.parse(admin) : null;
};

// Admin çıkış
export const adminLogout = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

// Admin şifre güncelle
export const updateAdminPassword = (currentPassword: string, newPassword: string) => {
  const currentAdmin = getCurrentAdmin();
  if (!currentAdmin) throw new Error('Admin bulunamadı');
  
  const admins = JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]') as Admin[];
  const adminIndex = admins.findIndex(a => a.id === currentAdmin.id);
  
  if (adminIndex === -1) throw new Error('Admin bulunamadı');
  
  if (admins[adminIndex].password !== currentPassword) {
    throw new Error('Mevcut şifre hatalı');
  }
  
  if (newPassword.length < 6) {
    throw new Error('Yeni şifre en az 6 karakter olmalı');
  }
  
  admins[adminIndex].password = newPassword;
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admins[adminIndex]));
};

// İstatistikler
export const getAdminStats = () => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const now = new Date();
  const today = now.toDateString();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const totalUsers = users.length;
  
  const totalFortunes = users.reduce((sum: number, user: any) => 
    sum + (user.fortunes?.length || 0), 0
  );
  
  const todayFortunes = users.reduce((sum: number, user: any) => {
    const todayUserFortunes = user.fortunes?.filter((f: any) => 
      new Date(f.timestamp).toDateString() === today
    ).length || 0;
    return sum + todayUserFortunes;
  }, 0);
  
  const activeUsers = users.filter((user: any) => 
    user.fortunes?.some((f: any) => new Date(f.timestamp) >= lastWeek)
  ).length;
  
  const thisMonthUsers = users.filter((user: any) => 
    new Date(user.createdAt) >= lastMonth
  ).length;
  
  const thisMonthFortunes = users.reduce((sum: number, user: any) => {
    const monthFortunes = user.fortunes?.filter((f: any) => 
      new Date(f.timestamp) >= lastMonth
    ).length || 0;
    return sum + monthFortunes;
  }, 0);
  
  return {
    totalUsers,
    totalFortunes,
    todayFortunes,
    activeUsers,
    userGrowth: totalUsers > 0 ? Math.round((thisMonthUsers / totalUsers) * 100) : 0,
    fortuneGrowth: totalFortunes > 0 ? Math.round((thisMonthFortunes / totalFortunes) * 100) : 0
  };
};

// Günlük fal istatistikleri
export const getDailyFortuneStats = (days = 30) => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const fortuneCount = users.reduce((sum: number, user: any) => {
      const dayFortunes = user.fortunes?.filter((f: any) => {
        const fDate = new Date(f.timestamp).toISOString().split('T')[0];
        return fDate === dateStr;
      }).length || 0;
      return sum + dayFortunes;
    }, 0);
    
    data.push({
      date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      count: fortuneCount
    });
  }
  
  return data;
};

// Saatlik fal dağılımı
export const getHourlyFortuneDistribution = () => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: `${i}:00`, count: 0 }));
  
  users.forEach((user: any) => {
    user.fortunes?.forEach((fortune: any) => {
      const hour = new Date(fortune.timestamp).getHours();
      hourlyData[hour].count++;
    });
  });
  
  return hourlyData;
};

// Tüm falları getir
export const getAllFortunes = (page = 1, perPage = 20, searchTerm = '') => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  
  const allFortunes: any[] = [];
  users.forEach((user: any) => {
    if (user.fortunes) {
      user.fortunes.forEach((fortune: any) => {
        allFortunes.push({
          ...fortune,
          userName: `${user.firstName} ${user.lastName}`,
          userId: user.id,
          userEmail: user.email
        });
      });
    }
  });
  
  allFortunes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  let filteredFortunes = allFortunes;
  if (searchTerm) {
    filteredFortunes = allFortunes.filter(f => 
      f.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedFortunes = filteredFortunes.slice(start, end);
  
  return {
    fortunes: paginatedFortunes,
    total: filteredFortunes.length,
    page,
    totalPages: Math.ceil(filteredFortunes.length / perPage)
  };
};

// Export all data
export const exportAllData = () => {
  const data = {
    users: JSON.parse(localStorage.getItem('coffee_users') || '[]'),
    admins: JSON.parse(localStorage.getItem('coffee_admins') || '[]'),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kahvefali-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export users to CSV
export const exportUsersToCSV = () => {
  const users = JSON.parse(localStorage.getItem('coffee_users') || '[]');
  
  const csvContent = [
    ['ID', 'Ad', 'Soyad', 'E-posta', 'Doğum Tarihi', 'Kayıt Tarihi', 'Fal Sayısı'],
    ...users.map((u: any) => [
      u.id,
      u.firstName,
      u.lastName,
      u.email,
      u.birthDate,
      new Date(u.createdAt).toLocaleString('tr-TR'),
      u.fortunes?.length || 0
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kullanicilar-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
