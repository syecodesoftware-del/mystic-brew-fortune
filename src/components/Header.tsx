import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Sparkles, ChevronDown } from 'lucide-react';
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
    const updateCoins = async () => {
      const user = await getCurrentUser();
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
      {/* Tek satır minimal header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-900 to-pink-600 text-white z-40 px-3 py-3 flex items-center justify-between shadow-lg">
        {/* Sol - Back button veya Hamburger Menu */}
        {showBackButton ? (
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronDown size={22} className="rotate-90" />
          </button>
        ) : (
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
        )}
        
        {/* Orta - Logo/Title */}
        <h1 className="text-sm font-bold flex items-center gap-1.5 flex-1 text-center">
          {title || '🔮 Kahve Falın'}
        </h1>
        
        {/* Sağ - Bildirim, Altın ve Profil */}
        <div className="flex items-center gap-2">
          {/* Bildirim */}
          <NotificationBell />
          
          {/* Altın badge */}
          <div className="flex items-center gap-1 bg-yellow-500 px-2 py-1 rounded-full text-xs font-bold shadow-md">
            💰 {coins}
          </div>
          
          {/* Profil ikonu */}
          {!showBackButton && (
            <Link 
              to="/profile"
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </header>

      {/* Spacer - içerik header'ın altından başlar */}
      <div className="lg:hidden h-[52px]"></div>

      {/* Slide-in Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menü */}
          <nav className="fixed top-0 left-0 w-64 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out">
            {/* Menü başlığı */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Menü</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Menü itemları */}
            <div className="p-4 space-y-2">
              <Link 
                to="/fortune" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Sparkles size={20} />
                <span>Fal Baktır</span>
              </Link>
              
              <Link 
                to="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <User size={20} />
                <span>Profilim</span>
              </Link>
              
              <div className="pt-4 border-t border-gray-800">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
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
    const updateHeader = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCoins(user.coins || 0);
        setUserName(user.first_name || 'Kullanıcı');
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
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-gradient-to-r from-purple-900 to-pink-600 text-white shadow-lg">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        🔮 Dijital Kahve Falın
      </h1>
      
      <div className="flex items-center gap-6">
        {/* Bildirim */}
        <NotificationBell />
        
        {/* Altın */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 rounded-full font-bold shadow-lg">
          <span className="text-2xl">💰</span>
          <span className="text-lg">{coins}</span>
        </div>
        
        {/* Profil */}
        <div className="relative group">
          <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
            <span className="font-medium">Merhaba, {userName}</span>
            <ChevronDown size={18} />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <Link 
              to="/profile"
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-t-lg"
            >
              <User size={18} />
              <span>Profilim</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg"
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
