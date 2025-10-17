import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, type User, checkAndGiveDailyBonus } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          // Check daily bonus
          const bonus = await checkAndGiveDailyBonus(currentUser.id);
          if (bonus) {
            toast({
              title: bonus.message,
              description: `${bonus.amount} altın kazandın! 💰`,
              duration: 5000
            });
            const updatedUser = await getCurrentUser();
            setUser(updatedUser);
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
