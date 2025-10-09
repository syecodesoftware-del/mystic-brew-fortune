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
    createdAt: new Date().toISOString(),
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
