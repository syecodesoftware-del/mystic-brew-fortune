import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Coffee, Star, Heart, Hand, Flame, CloudSun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { LucideIcon } from 'lucide-react';

interface FortuneType {
  type: string;
  title: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
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
      icon: Coffee,
      description: 'Geleneksel kahve falı yorumlama',
      gradient: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      isActive: true
    },
    {
      type: 'tarot',
      title: 'Tarot Falı',
      icon: Sparkles,
      description: 'Tarot kartları ile gelecek yorumu',
      gradient: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'el',
      title: 'El Falı',
      icon: Hand,
      description: 'Avuç içi çizgilerinden fal',
      gradient: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'katina',
      title: 'Katina Falı',
      icon: Flame,
      description: 'Ateş ve mum ile mistik yorum',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'yildiz',
      title: 'Yıldız Falı',
      icon: Star,
      description: 'Astroloji ve burç yorumu',
      gradient: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'ask',
      title: 'Aşk Falı',
      icon: Heart,
      description: 'İlişkiler ve aşk hayatı yorumu',
      gradient: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fortuneTypes.map((fortune, index) => {
                const IconComponent = fortune.icon;
                
                return (
                  <motion.div
                    key={fortune.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => fortune.isActive && handleFortuneTypeClick(fortune.type)}
                    className={`
                      relative overflow-hidden rounded-2xl p-6 cursor-pointer
                      transition-all duration-300
                      ${fortune.isActive 
                        ? `${fortune.bgColor} border-2 ${fortune.borderColor} group hover:shadow-xl hover:scale-105` 
                        : 'bg-white/40 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    {/* Badge */}
                    {fortune.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] text-xs font-bold text-white shadow-lg">
                        {fortune.badge}
                      </div>
                    )}
                    
                    {/* Gradient background on hover */}
                    {fortune.isActive && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${fortune.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    )}
                    
                    {/* Icon Container */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${fortune.gradient} flex items-center justify-center mb-4 ${fortune.isActive ? 'group-hover:scale-110' : ''} transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    
                    {/* Content */}
                    <div className="relative">
                      <h3 className={`text-xl font-bold mb-2 ${fortune.isActive ? 'text-foreground group-hover:bg-gradient-to-r group-hover:from-[hsl(258,90%,76%)] group-hover:to-[hsl(243,75%,59%)] group-hover:bg-clip-text group-hover:text-transparent' : 'text-gray-600'} transition-all`}>
                        {fortune.title}
                      </h3>
                      <p className={`text-sm mb-4 ${fortune.isActive ? 'text-muted-foreground group-hover:text-foreground' : 'text-gray-500'} transition-colors`}>
                        {fortune.description}
                      </p>
                    </div>
                    
                    {/* Arrow indicator */}
                    {fortune.isActive && (
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${fortune.gradient} flex items-center justify-center`}>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default Index;
