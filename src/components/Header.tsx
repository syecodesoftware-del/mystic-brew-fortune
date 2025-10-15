import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Sparkles, ChevronDown, Bell } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

const MobileHeader = ({ showBackButton, title }: HeaderProps) => {
  const [coins, setCoins] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCoins = () => {
      const user = getCurrentUser();
      if (user) setCoins(user.coins || 0);
    };

    updateCoins();
    window.addEventListener('coinsUpdated', updateCoins);
    
    return () => window.removeEventListener('coinsUpdated', updateCoins);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('coffee_current_user');
    navigate('/');
  };

  return (
    <>
      {/* Header - Yeni Tasarım */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between bg-background/80 backdrop-blur-lg border-b border-white/10">
        {/* Sol - Menu/Back button */}
        {showBackButton ? (
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronDown size={22} className="rotate-90 text-white" />
          </button>
        ) : (
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={22} className="text-white" />
          </button>
        )}
        
        {/* Orta - Logo */}
        <h1 className="text-2xl font-bold font-handwriting text-white flex-1 text-center">
          {title || 'Falcan'}
        </h1>
        
        {/* Sağ - Notifications, Coins, Profile */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          
          {/* Altın badge - Yeni tasarım */}
          <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">
            <span className="text-xl">💰</span>
            <span className="text-white font-bold text-sm">{coins}</span>
          </div>
          
          {!showBackButton && (
            <Link 
              to="/profile"
              className="p-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 transition-colors"
            >
              <User size={18} className="text-white" />
            </Link>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="lg:hidden h-[60px]"></div>

      {/* Slide-in Menu - Yeni Tasarım */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <nav className="fixed top-0 left-0 w-64 h-full bg-background/95 backdrop-blur-xl border-r border-white/10 text-white z-50 transform transition-transform duration-300 ease-in-out">
            {/* Menu başlığı */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold font-handwriting">Menü</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Menu items */}
            <div className="p-4 space-y-2">
              <Link 
                to="/fortune" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display"
              >
                <Sparkles size={20} />
                <span>Fal Baktır</span>
              </Link>
              
              <Link 
                to="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors font-display"
              >
                <User size={20} />
                <span>Profilim</span>
              </Link>
              
              <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors font-display"
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

const DesktopHeader = () => {
  const [coins, setCoins] = useState(0);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateHeader = () => {
      const user = getCurrentUser();
      if (user) {
        setCoins(user.coins || 0);
        setUserName(user.firstName || 'Kullanıcı');
      }
    };

    updateHeader();
    window.addEventListener('coinsUpdated', updateHeader);
    
    return () => window.removeEventListener('coinsUpdated', updateHeader);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('coffee_current_user');
    navigate('/');
  };

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-background/80 backdrop-blur-lg border-b border-white/10 text-white">
      {/* Logo - Yeni Tasarım */}
      <h1 className="text-4xl font-bold font-handwriting text-glow">
        Falcan
      </h1>
      
      <div className="flex items-center gap-6">
        {/* Bildirim */}
        <NotificationBell />
        
        {/* Altın - Yeni tasarım */}
        <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-2 rounded-full font-bold shadow-lg">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-display">{coins}</span>
        </div>
        
        {/* Profil Dropdown - Yeni tasarım */}
        <div className="relative group">
          <button className="flex items-center gap-2 glass px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
            <User size={18} />
            <span className="font-medium font-display">{userName}</span>
            <ChevronDown size={18} />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden">
            <Link 
              to="/profile"
              className="flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 font-display"
            >
              <User size={18} />
              <span>Profilim</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 font-display"
            >
              <LogOut size={18} />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const Header = ({ showBackButton, title }: HeaderProps = {}) => {
  return (
    <>
      <MobileHeader showBackButton={showBackButton} title={title} />
      <DesktopHeader />
    </>
  );
};

export default Header;
