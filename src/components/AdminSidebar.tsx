import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Send
} from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import logo from '@/assets/logo.png';

const AdminSidebar = () => {
  const location = useLocation();
  const { admin, logout } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/admin/fortunes', icon: Sparkles, label: 'Fallar' },
    { path: '/admin/notifications', icon: Send, label: 'Bildirimler' },
    { path: '/admin/statistics', icon: BarChart3, label: 'İstatistikler' },
    { path: '/admin/settings', icon: Settings, label: 'Ayarlar' }
  ];
  
  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white flex items-center justify-between px-4 z-50 shadow-lg">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-lg font-semibold">Kahve Falı Admin</h1>
        </div>
        <div className="w-10"></div>
      </div>
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold">Kahve Falı</h1>
                <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${active 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:shadow-md'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Admin Info & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {admin?.firstName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {admin?.firstName || 'Admin'} {admin?.lastName || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {admin?.email || 'admin@kahvefali.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 hover:shadow-md"
          >
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
