import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, type User, checkAndGiveDailyBonus, migrateUsersToCoins } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Migrate existing users to coins
        migrateUsersToCoins();
        
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Defensive sync: ensure current user exists in coffee_users
        if (currentUser) {
          try {
            const USERS_KEY = 'coffee_users';
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
            const exists = users.some((u: any) => u.id === currentUser.id || u.email === currentUser.email);
            if (!exists) {
              users.push(currentUser);
              localStorage.setItem(USERS_KEY, JSON.stringify(users));
              console.log('Synchronized current user into coffee_users');
            }
          } catch (e) {
            console.warn('User sync check failed', e);
          }

          // Check daily bonus
          const bonus = checkAndGiveDailyBonus();
          if (bonus) {
            toast({
              title: bonus.message,
              description: `Yeni bakiyen: ${bonus.newBalance} 💰`,
              duration: 5000
            });
            setUser(getCurrentUser());
            window.dispatchEvent(new Event('coinsUpdated'));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [toast]);

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
