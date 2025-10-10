import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, type User } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Defensive sync: ensure current user exists in coffee_users
    try {
      if (currentUser) {
        const USERS_KEY = 'coffee_users';
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const exists = users.some((u: any) => u.id === currentUser.id || u.email === currentUser.email);
        if (!exists) {
          users.push(currentUser);
          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          console.log('Synchronized current user into coffee_users');
        }
      }
    } catch (e) {
      console.warn('User sync check failed', e);
    }

    setLoading(false);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return {
    user,
    loading,
    logout,
    updateUser,
    isAuthenticated: !!user
  };
};
