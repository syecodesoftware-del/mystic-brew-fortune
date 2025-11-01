import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { Bell, User as UserIcon, Sparkles } from 'lucide-react';
import type { User } from '@/lib/supabase';
import falcanLogo from '@/assets/falcan-logo-clear.png';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    loadUser();
  }, []);
  
  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };
  
  // Login/register/landing sayfalarında header gösterme
  if (['/login', '/register', '/', '/admin/login'].includes(window.location.pathname)) {
    return null;
  }
  
  if (!user) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/fortune')}
        >
          <img 
            src={falcanLogo} 
            alt="Falcan Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-xl font-bold gradient-text font-mystic leading-tight">
              FALCAN
            </h1>
            <p className="text-xs text-white/60 font-medium">Enerjini keşfet...</p>
          </div>
        </div>
        
        {/* Right side: Coins, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30">
            <span className="text-lg">💰</span>
            <span className="font-bold text-amber-300">{user.coins}</span>
          </div>
          
          {/* Notifications Button */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            aria-label="Bildirimler"
          >
            <Bell size={20} className="text-white" />
          </button>
          
          {/* Profile Button with Photo/Name */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
            aria-label="Profil"
          >
            {user.profile_photo ? (
              <img 
                src={user.profile_photo} 
                alt="Profil"
                className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center border-2 border-cyan-400/30">
                <span className="text-xs font-bold text-white">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-white hidden sm:block">
              {user.first_name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
