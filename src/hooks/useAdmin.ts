import { useState, useEffect } from 'react';
import { getCurrentAdmin, adminLogout, type AdminUser } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';

export const useAdmin = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') {
          setAdmin(null);
        } else if (event === 'SIGNED_IN') {
          await checkAdmin();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async () => {
    setLoading(true);
    const currentAdmin = await getCurrentAdmin();
    setAdmin(currentAdmin);
    setLoading(false);
  };

  const logout = async () => {
    await adminLogout();
    setAdmin(null);
  };

  return {
    admin,
    loading,
    logout,
    isAuthenticated: !!admin
  };
};
