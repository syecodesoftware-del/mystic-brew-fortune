import { supabase } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

// Check if current user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (error || !data) return false;

    return data.role === 'admin';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// Get current admin user
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) return null;

    return {
      id: user.id,
      email: user.email!,
      role: 'admin'
    };
  } catch (error) {
    console.error('Get admin error:', error);
    return null;
  }
};

// Admin login with Supabase Auth
export const adminLogin = async (email: string, password: string) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Kullanıcı bulunamadı');

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      // Not an admin, sign them out
      await supabase.auth.signOut();
      throw new Error('Bu hesabın admin yetkisi yok');
    }

    return authData.user;
  } catch (error: any) {
    throw new Error(error.message || 'Giriş yapılamadı');
  }
};

// Admin logout
export const adminLogout = async () => {
  await supabase.auth.signOut();
};

// Get admin stats (from Supabase)
export const getAdminStats = async () => {
  try {
    // Get total users count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total fortunes count
    const { count: totalFortunes } = await supabase
      .from('fortunes')
      .select('*', { count: 'exact', head: true });

    // Get today's fortunes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todayFortunes } = await supabase
      .from('fortunes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get active users (had fortune in last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: activeFortunes } = await supabase
      .from('fortunes')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString());

    const uniqueActiveUsers = new Set(activeFortunes?.map(f => f.user_id) || []);

    return {
      totalUsers: totalUsers || 0,
      totalFortunes: totalFortunes || 0,
      todayFortunes: todayFortunes || 0,
      activeUsers: uniqueActiveUsers.size,
      userGrowth: 0, // TODO: Calculate based on monthly data
      fortuneGrowth: 0, // TODO: Calculate based on monthly data
    };
  } catch (error) {
    console.error('Stats error:', error);
    return {
      totalUsers: 0,
      totalFortunes: 0,
      todayFortunes: 0,
      activeUsers: 0,
      userGrowth: 0,
      fortuneGrowth: 0,
    };
  }
};
