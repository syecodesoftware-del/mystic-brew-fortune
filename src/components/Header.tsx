import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import type { User } from '@/lib/supabase';
import NotificationBell from './NotificationBell';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    loadUser();
    
    // Coin güncellemelerini dinle
    const handleCoinsUpdate = () => loadUser();
    window.addEventListener('coinsUpdated', handleCoinsUpdate);
    
    return () => window.removeEventListener('coinsUpdated', handleCoinsUpdate);
  }, [location.pathname]);
  
  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };
  
  // Login/register/landing sayfalarında header gösterme
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return null;
  }
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutUser();
  };
  
  return (
    <>
      {/* Desktop & Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[hsl(258,90%,76%)]/20 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/fortune')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center">
              <span className="text-2xl">🔮</span>
            </div>
            <h1 className="text-xl font-bold text-[hsl(220,13%,18%)] font-mystic hidden sm:block">Falcan</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            <NotificationBell />
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(43,96%,56%)]/20 border border-[hsl(43,96%,56%)]/30">
              <span className="text-lg">💰</span>
              <span className="font-bold text-[hsl(220,13%,18%)]">{user.coins}</span>
            </div>
            
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-[hsl(258,90%,76%)]/20 hover:bg-white transition-colors"
            >
              <UserIcon size={18} className="text-[hsl(220,13%,18%)]" />
              <span className="text-sm font-medium text-[hsl(220,13%,18%)]">{user.first_name}</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/70 border border-red-500/20 hover:bg-red-50 transition-colors text-red-500"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[hsl(43,96%,56%)]/20 border border-[hsl(43,96%,56%)]/30">
              <span>💰</span>
              <span className="font-bold text-sm text-[hsl(220,13%,18%)]">{user.coins}</span>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-xl bg-white/70 border border-[hsl(258,90%,76%)]/20 hover:bg-white transition-colors"
            >
              <Menu size={20} className="text-[hsl(220,13%,18%)]" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-[64px]"></div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <nav className="fixed top-0 right-0 w-64 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl md:hidden">
            {/* Menu Header */}
            <div className="p-4 border-b border-[hsl(258,90%,76%)]/20 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[hsl(220,13%,18%)]">Menü</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* User Info */}
            <div className="p-4 border-b border-[hsl(258,90%,76%)]/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center text-white font-bold text-lg">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-[hsl(220,13%,18%)]">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-[hsl(220,9%,46%)]">{user.email}</p>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <button 
                onClick={() => {
                  navigate('/fortune');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(258,90%,76%)]/10 transition-colors text-[hsl(220,13%,18%)]"
              >
                <span className="text-xl">🔮</span>
                <span>Fal Baktır</span>
              </button>
              
              <button 
                onClick={() => {
                  navigate('/profile');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[hsl(258,90%,76%)]/10 transition-colors text-[hsl(220,13%,18%)]"
              >
                <UserIcon size={20} />
                <span>Profilim</span>
              </button>
              
              <div className="pt-4 border-t border-[hsl(258,90%,76%)]/20">
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Header;
