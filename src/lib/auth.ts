export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
  birthTime: string;
  createdAt: string;
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

export const registerUser = (userData: Omit<User, 'id' | 'createdAt' | 'fortunes'>) => {
  try {
    console.log('[registerUser] starting...');
    console.log('[registerUser] localStorage keys before:', Object.keys(localStorage));

    const raw = localStorage.getItem(USERS_KEY);
    console.log('[registerUser] raw coffee_users before:', raw);
    const users = JSON.parse(raw || '[]') as User[];
    console.log('[registerUser] users length before:', users.length);
    
    if (users.find(u => u.email === userData.email)) {
      console.warn('[registerUser] duplicate email detected:', userData.email);
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
      createdAt: new Date().toISOString(),
      fortunes: []
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const afterRaw = localStorage.getItem(USERS_KEY);
    console.log('[registerUser] raw coffee_users after:', afterRaw);
    try {
      const afterUsers = JSON.parse(afterRaw || '[]');
      console.log('[registerUser] users length after:', Array.isArray(afterUsers) ? afterUsers.length : 'not-array');
    } catch (e) {
      console.warn('[registerUser] parse after failed', e);
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    console.log('[registerUser] current user set:', newUser.email);
    
    return newUser;
  } catch (e) {
    console.error('[registerUser] failed:', e);
    throw e;
  }
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
