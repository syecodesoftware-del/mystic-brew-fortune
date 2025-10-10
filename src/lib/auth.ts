export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  birthTime: string;
  city: string;
  gender: string;
  createdAt: string;
  coins: number;
  lastDailyBonus: string;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  fortunes: Fortune[];
}

export interface Fortune {
  id: number;
  fortune: string;
  timestamp: string;
  imageUrl?: string;
}

const USERS_KEY = 'coffee_users';
const CURRENT_USER_KEY = 'coffee_current_user';

export const registerUser = (userData: Omit<User, 'id' | 'createdAt' | 'fortunes' | 'coins' | 'lastDailyBonus' | 'totalCoinsEarned' | 'totalCoinsSpent'>) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  
  if (users.find(u => u.email === userData.email)) {
    throw new Error('Bu e-posta adresi zaten kayıtlı');
  }
  
  const newUser: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    birthDate: userData.birthDate,
    birthTime: userData.birthTime,
    city: userData.city,
    gender: userData.gender,
    createdAt: new Date().toISOString(),
    coins: 50,
    lastDailyBonus: new Date().toISOString().split('T')[0],
    totalCoinsEarned: 50,
    totalCoinsSpent: 0,
    fortunes: []
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const loginUser = (email: string, password: string) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('E-posta veya şifre hatalı');
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const saveFortune = (fortune: string, imageUrl?: string) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    const newFortune: Fortune = {
      id: Date.now(),
      fortune,
      timestamp: new Date().toISOString(),
      imageUrl
    };
    
    users[userIndex].fortunes.push(newFortune);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const updatedUser = users[userIndex];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
};

export const updateUserProfile = (updatedData: {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthTime: string;
  city: string;
  gender: string;
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}) => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Kullanıcı bulunamadı');

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  
  if (updatedData.newPassword) {
    if (currentUser.password !== updatedData.currentPassword) {
      throw new Error('Mevcut şifre hatalı');
    }
    if (updatedData.newPassword !== updatedData.newPasswordConfirm) {
      throw new Error('Yeni şifreler eşleşmiyor');
    }
    if (updatedData.newPassword.length < 6) {
      throw new Error('Yeni şifre en az 6 karakter olmalı');
    }
  }
  
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      birthDate: updatedData.birthDate,
      birthTime: updatedData.birthTime,
      city: updatedData.city,
      gender: updatedData.gender,
      ...(updatedData.newPassword && { password: updatedData.newPassword }),
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    
    return users[userIndex];
  }
  
  throw new Error('Kullanıcı güncellenemedi');
};

export const getUserFortunes = (): Fortune[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const user = users.find(u => u.id === currentUser.id);
  
  return user?.fortunes || [];
};

export const deleteFortune = (fortuneId: number) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex].fortunes = users[userIndex].fortunes.filter(
      f => f.id !== fortuneId
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  }
};

export const deleteUser = (userId: string) => {
  let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const adminUpdateUser = (userId: string, updatedData: {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  birthTime: string;
  city: string;
  gender: string;
  password?: string;
}) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  // Email değişikliği kontrolü
  if (updatedData.email !== users[userIndex].email) {
    const emailExists = users.some(u => u.email === updatedData.email && u.id !== userId);
    if (emailExists) {
      throw new Error('Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor');
    }
  }
  
  users[userIndex] = {
    ...users[userIndex],
    firstName: updatedData.firstName,
    lastName: updatedData.lastName,
    email: updatedData.email,
    birthDate: updatedData.birthDate,
    birthTime: updatedData.birthTime,
    city: updatedData.city,
    gender: updatedData.gender,
    ...(updatedData.password && { password: updatedData.password }),
  };
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Eğer güncellenene kullanıcı şu anki kullanıcıysa, current_user'ı da güncelle
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  }
  
  return users[userIndex];
};

export const downloadFortune = (fortune: Fortune) => {
  const content = `
╔════════════════════════════════════╗
║     ✨ Dijital Kahve Falın ✨      ║
╚════════════════════════════════════╝

Tarih: ${new Date(fortune.timestamp).toLocaleString('tr-TR')}

${fortune.fortune}

────────────────────────────────────
🌙 Telvenin içindeki semboller
   senin enerjini fısıldıyor...
  `;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kahve-fali-${fortune.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const checkAndGiveDailyBonus = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) return null;
  
  const today = new Date().toISOString().split('T')[0];
  const lastBonus = users[userIndex].lastDailyBonus;
  
  if (lastBonus !== today) {
    users[userIndex].coins += 20;
    users[userIndex].lastDailyBonus = today;
    users[userIndex].totalCoinsEarned += 20;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    
    return {
      bonus: 20,
      newBalance: users[userIndex].coins,
      message: '🎉 Günlük 20 altın kazandın!'
    };
  }
  
  return null;
};

export const checkCoinsAndDeduct = (cost: number = 10): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex === -1) return false;
  
  if (users[userIndex].coins < cost) {
    return false;
  }
  
  users[userIndex].coins -= cost;
  users[userIndex].totalCoinsSpent += cost;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  
  return true;
};

export const refundCoins = (amount: number) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex].coins += amount;
    users[userIndex].totalCoinsSpent -= amount;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  }
};

export const adminGiveCoins = (userId: string, amount: number) => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Kullanıcı bulunamadı');
  }
  
  users[userIndex].coins += amount;
  users[userIndex].totalCoinsEarned += amount;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  }
  
  return users[userIndex];
};

export const migrateUsersToCoins = () => {
  let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as User[];
  let updated = false;
  
  users = users.map(user => {
    if (user.coins === undefined) {
      updated = true;
      return {
        ...user,
        coins: 50,
        lastDailyBonus: new Date().toISOString().split('T')[0],
        totalCoinsEarned: 50,
        totalCoinsSpent: 0
      };
    }
    return user;
  });
  
  if (updated) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.coins === undefined) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }
    }
  }
};
