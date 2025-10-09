import { useState, useEffect } from 'react';
import { getCurrentAdmin, adminLogout, initializeAdmin, type Admin } from '@/lib/admin';

export const useAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAdmin();
    const currentAdmin = getCurrentAdmin();
    setAdmin(currentAdmin);
    setLoading(false);
  }, []);

  const logout = () => {
    adminLogout();
    setAdmin(null);
  };

  return {
    admin,
    loading,
    logout,
    isAuthenticated: !!admin
  };
};
