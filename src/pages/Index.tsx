import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FortuneType {
  type: string;
  title: string;
  emoji: string;
  isActive: boolean;
  badge?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fortuneTypes: FortuneType[] = [
    {
      type: 'kahve',
      title: 'Kahve Falı',
      emoji: '☕',
      isActive: true
    },
    {
      type: 'tarot',
      title: 'Tarot Falı',
      emoji: '🎴',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'el',
      title: 'El Falı',
      emoji: '🤚',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'katina',
      title: 'Katina Falı',
      emoji: '🕯️',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'yuz',
      title: 'Yüz Falı',
      emoji: '👤',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'melek',
      title: 'Melek Kartları',
      emoji: '😇',
      isActive: false,
      badge: 'Yakında'
    }
  ];
  
  const handleFortuneTypeClick = (type: string) => {
    navigate(`/fortune/${type}`);
  };
  
  const stats = [
    { label: 'Mutlu Kullanıcı', value: '50K+', icon: '👥' },
    { label: 'Bakılan Fal', value: '200K+', icon: '🔮' },
    { label: 'Uzman Falcı', value: '5', icon: '⭐' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,78%,5%)] via-[hsl(252,50%,12%)] to-[hsl(252,78%,5%)] relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-[hsl(243,75%,59%)]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[hsl(243,75%,59%)] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔮</span>
              </div>
              <h1 className="text-2xl font-mystic font-bold text-white tracking-wide">
                Falcan
              </h1>
            </div>
            
            {/* Nav */}
            <nav className="flex items-center gap-3">
              {/* Coins */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(43,96%,56%)] to-yellow-600 flex items-center justify-center">
                  <span className="text-xs">💰</span>
                </div>
                <span className="font-semibold text-white">100</span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                <Bell size={20} className="text-white/80" />
              </button>
              
              {/* Profile */}
              <button 
                onClick={() => navigate('/profile')}
                className="p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
              >
                <User size={20} className="text-white/80" />
              </button>
            </nav>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/70">Falcılar çevrimiçi</span>
            </motion.div>
            
            {/* Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight"
            >
              Geleceğini
              <span className="block bg-gradient-to-r from-accent via-primary to-[hsl(243,75%,59%)] bg-clip-text text-transparent">
                Keşfet
              </span>
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
            >
              Binlerce yıllık bilgelik ve modern teknoloji bir arada. Kaderini öğren, geleceğini şekillendir.
            </motion.p>
            
            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button 
                onClick={() => navigate('/fortune/kahve')}
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-accent via-primary to-[hsl(243,75%,59%)] text-white font-semibold shadow-[0_4px_24px_rgba(109,71,220,0.25)] hover:shadow-[0_8px_32px_rgba(109,71,220,0.4)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Fal Baktır</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium hover:bg-white/10 transition-all">
                Nasıl Çalışır?
              </button>
            </motion.div>
          </div>
        </section>
        
        {/* Fortune Types Grid */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {fortuneTypes.map((fortune, index) => (
              <motion.div
                key={fortune.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => fortune.isActive && handleFortuneTypeClick(fortune.type)}
                className={`
                  group relative overflow-hidden
                  rounded-3xl p-8 cursor-pointer
                  transition-all duration-500
                  ${fortune.isActive 
                    ? `
                      bg-gradient-to-br from-white/[0.08] to-white/[0.02]
                      backdrop-blur-xl border border-white/10
                      hover:border-accent/30
                      hover:shadow-[0_16px_48px_rgba(109,71,220,0.15)]
                      hover:scale-[1.02]
                    ` 
                    : 'bg-white/[0.02] border border-white/5 opacity-40 cursor-not-allowed'
                  }
                `}
              >
                {/* Badge */}
                {fortune.badge && (
                  <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(43,96%,56%)] to-yellow-600 text-xs font-bold text-[hsl(252,78%,5%)] shadow-lg animate-pulse">
                    {fortune.badge}
                  </div>
                )}
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                    {fortune.emoji}
                  </div>
                  {fortune.isActive && (
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-display font-semibold text-white mb-2">
                  {fortune.title}
                </h3>
                
                {/* Arrow (only for active) */}
                {fortune.isActive && (
                  <div className="flex items-center gap-2 text-accent/80 group-hover:text-accent transition-colors">
                    <span className="text-sm font-medium">Keşfet</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
                
                {/* Hover gradient overlay */}
                {fortune.isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Social Proof / Stats */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="text-3xl">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
