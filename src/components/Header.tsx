import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';
import { Bell, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/supabase';

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[hsl(258,90%,76%)]/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate('/fortune')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center">
            <span className="text-2xl">🔮</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] bg-clip-text text-transparent font-mystic leading-tight">
              FALCAN
            </h1>
            <p className="text-xs text-[hsl(220,9%,46%)] font-medium">Enerjini keşfet...</p>
          </div>
        </div>
        
        {/* Right side: Coins, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(43,96%,56%)]/20 border border-[hsl(43,96%,56%)]/30">
            <span className="text-lg">💰</span>
            <span className="font-bold text-[hsl(220,13%,18%)]">{user.coins}</span>
          </div>
          
          {/* Notifications Button */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl bg-white/70 border border-[hsl(258,90%,76%)]/20 hover:bg-white hover:shadow-lg transition-all"
            aria-label="Bildirimler"
          >
            <Bell size={20} className="text-[hsl(220,13%,18%)]" />
          </button>
          
          {/* Profile Button with Photo/Name */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-[hsl(258,90%,76%)]/20 hover:bg-white hover:shadow-lg transition-all"
            aria-label="Profil"
          >
            {user.profile_photo ? (
              <img 
                src={user.profile_photo} 
                alt="Profil"
                className="w-8 h-8 rounded-full object-cover border-2 border-[hsl(258,90%,76%)]/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center border-2 border-[hsl(258,90%,76%)]/30">
                <span className="text-xs font-bold text-white">
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-[hsl(220,13%,18%)] hidden sm:block">
              {user.first_name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
