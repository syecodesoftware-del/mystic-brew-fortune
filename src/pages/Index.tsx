import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bell, User, Sparkles } from 'lucide-react';
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
    { 
      icon: '🌟', 
      value: '50,000+', 
      label: 'Mutlu Kullanıcı',
      gradient: 'from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)]'
    },
    { 
      icon: '🔮', 
      value: '200,000+', 
      label: 'Bakılan Fal',
      gradient: 'from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)]'
    },
    { 
      icon: '⭐', 
      value: '4.9/5', 
      label: 'Ortalama Puan',
      gradient: 'from-[hsl(243,75%,59%)] to-[hsl(330,81%,70%)]'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(270,100%,99%)] via-[hsl(270,100%,97%)] to-[hsl(270,100%,95%)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-gradient-radial from-[hsl(330,81%,70%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Floating sparkles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <div className="text-xl opacity-60">✨</div>
            </div>
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] flex items-center justify-center shadow-lg">
                <span className="text-3xl">🔮</span>
              </div>
              <div>
                <h1 className="text-2xl font-mystic font-bold text-foreground tracking-wide">
                  Falcan
                </h1>
                <p className="text-xs text-muted-foreground">Geleceğini keşfet</p>
              </div>
            </div>
            
            {/* Nav */}
            <nav className="flex items-center gap-3">
              {/* Coins */}
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[hsl(43,96%,56%)]/20 to-[hsl(24,95%,61%)]/20 backdrop-blur-md border border-[hsl(43,96%,56%)]/30 shadow-lg">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] flex items-center justify-center shadow-md">
                  <span className="text-base">💰</span>
                </div>
                <span className="font-bold text-foreground">100</span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-3 rounded-xl bg-white/70 backdrop-blur-md border border-primary/20 hover:bg-white shadow-md hover:shadow-lg transition-all">
                <Bell size={20} className="text-foreground" />
              </button>
              
              {/* Profile */}
              <button 
                onClick={() => navigate('/profile')}
                className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-primary/20 hover:bg-white shadow-md hover:shadow-lg transition-all"
              >
                <User size={20} className="text-foreground" />
              </button>
            </nav>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Floating badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 backdrop-blur-md border border-primary/20 shadow-lg"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg" />
              <span className="text-sm font-medium text-foreground">5 falcı çevrimiçi <Sparkles className="inline w-4 h-4 ml-1" /></span>
            </motion.div>
            
            {/* Main heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight"
            >
              Geleceğini
              <span className="block mt-2 bg-gradient-to-r from-[hsl(258,90%,76%)] via-[hsl(243,75%,59%)] to-[hsl(330,81%,70%)] bg-clip-text text-transparent">
                Aydınlat ✨
              </span>
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Binlerce yıllık bilgelik ve modern teknoloji bir arada. Umudunu taşıyan, yolunu aydınlatan fallar burada.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <button 
                onClick={() => navigate('/fortune/kahve')}
                className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] text-white font-semibold shadow-[0_4px_24px_rgba(167,139,250,0.35)] hover:shadow-[0_8px_32px_rgba(167,139,250,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <span className="flex items-center justify-center gap-2 relative z-10">
                  🔮 Fal Baktır
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/70 backdrop-blur-md border border-primary/20 text-foreground font-medium hover:bg-white hover:shadow-lg transition-all">
                Nasıl Çalışır?
              </button>
            </motion.div>
          </div>
        </section>
        
        {/* Fortune Types Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <h3 className="text-3xl font-mystic font-bold text-foreground mb-2">
                Fal Türlerini Keşfet
              </h3>
              <p className="text-muted-foreground">
                Sana en uygun fal türünü seç, yolculuğuna başla
              </p>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {fortuneTypes.map((fortune, index) => (
                <motion.div
                  key={fortune.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => fortune.isActive && handleFortuneTypeClick(fortune.type)}
                  className={`
                    group relative overflow-hidden
                    rounded-3xl p-4 sm:p-6 lg:p-8 cursor-pointer
                    transition-all duration-500
                    ${fortune.isActive 
                      ? `
                        bg-white/70 backdrop-blur-xl
                        border border-primary/20
                        shadow-[0_8px_32px_rgba(167,139,250,0.12)]
                        hover:bg-white/80
                        hover:border-primary/30
                        hover:shadow-[0_16px_48px_rgba(167,139,250,0.25)]
                        hover:-translate-y-2
                      ` 
                      : 'bg-white/40 border border-primary/10 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Badge */}
                  {fortune.badge && (
                    <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] text-[10px] sm:text-xs font-bold text-white shadow-lg">
                      {fortune.badge}
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="relative mb-3 sm:mb-4 lg:mb-6">
                    <div className="text-4xl sm:text-5xl lg:text-7xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {fortune.emoji}
                    </div>
                    {fortune.isActive && (
                      <>
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -top-2 -right-2 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping">
                          ✨
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-base sm:text-lg lg:text-xl font-mystic font-bold text-foreground mb-2 sm:mb-3">
                    {fortune.title}
                  </h3>
                  
                  {/* CTA */}
                  {fortune.isActive && (
                    <div className="flex items-center gap-2 text-primary group-hover:text-[hsl(258,90%,66%)] transition-colors">
                      <span className="text-sm font-semibold">Keşfet</span>
                      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  {fortune.isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[hsl(258,90%,76%)]/5 via-[hsl(243,75%,59%)]/5 to-[hsl(330,81%,70%)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Social Proof / Trust Signals */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-3xl p-8 lg:p-12 bg-white/70 backdrop-blur-xl border border-primary/20 shadow-[0_8px_32px_rgba(167,139,250,0.15)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center space-y-3"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <span className="text-3xl">{stat.icon}</span>
                    </div>
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
