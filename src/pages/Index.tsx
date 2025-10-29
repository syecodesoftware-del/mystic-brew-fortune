import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Coffee, Star, Heart, Moon, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import SpaceBackground from '@/components/SpaceBackground';
import type { LucideIcon } from 'lucide-react';

interface FortuneType {
  type: string;
  title: string;
  icon: LucideIcon;
  emoji: string;
  gradient: string;
  glowColor: string;
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
      emoji: '☕',
      gradient: 'from-amber-700 to-orange-600',
      glowColor: 'shadow-amber-500/50',
      isActive: true
    },
    {
      type: 'tarot',
      title: 'Tarot',
      icon: Moon,
      emoji: '🌙',
      gradient: 'from-indigo-600 to-purple-600',
      glowColor: 'shadow-purple-500/50',
      isActive: true
    },
    {
      type: 'ask',
      title: 'Çift Falı',
      icon: Heart,
      emoji: '💕',
      gradient: 'from-pink-500 to-rose-600',
      glowColor: 'shadow-pink-500/50',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'yildiz',
      title: 'Yıldız Falı',
      icon: Star,
      emoji: '⭐',
      gradient: 'from-yellow-500 to-amber-600',
      glowColor: 'shadow-yellow-500/50',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'ruya',
      title: 'Rüya Yorumu',
      icon: Eye,
      emoji: '👁️',
      gradient: 'from-cyan-500 to-blue-600',
      glowColor: 'shadow-cyan-500/50',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'el',
      title: 'El Falı',
      icon: Zap,
      emoji: '✋',
      gradient: 'from-emerald-500 to-teal-600',
      glowColor: 'shadow-emerald-500/50',
      isActive: true,
      badge: null
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
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-12 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Floating badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg" />
              <span className="text-sm font-medium text-white">5 falcı çevrimiçi <Sparkles className="inline w-4 h-4 ml-1" /></span>
            </motion.div>
            
            {/* Main heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight"
            >
              Geleceğini
              <span className="block mt-2 gradient-text">
                Aydınlat ✨
              </span>
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
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
              <Button 
                onClick={() => navigate('/fortune/kahve')}
                className="w-full sm:w-auto"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  🔮 Fal Baktır
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                variant="secondary"
                className="w-full sm:w-auto"
                size="lg"
              >
                Nasıl Çalışır?
              </Button>
            </motion.div>
          </div>
        </section>
        
        {/* Fortune Types Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-10">
              <h3 className="text-3xl font-mystic font-bold text-white mb-2">
                Fal Türlerini Keşfet
              </h3>
              <p className="text-white/70">
                Sana en uygun fal türünü seç, yolculuğuna başla
              </p>
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto px-4">
              {fortuneTypes.map((fortune, index) => {
                const IconComponent = fortune.icon;
                
                return (
                  <motion.div
                    key={fortune.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => fortune.isActive && handleFortuneTypeClick(fortune.type)}
                    className={`relative group ${fortune.isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  >
                    {/* Card */}
                    <div className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 border transition-all duration-300 ${
                      fortune.isActive 
                        ? 'border-white/20 hover:border-cyan-400/50 hover:shadow-2xl hover:-translate-y-2' 
                        : 'border-white/10'
                    }`}>
                      
                      {/* Badge */}
                      {fortune.badge && (
                        <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] text-[10px] font-bold text-white shadow-lg z-10">
                          {fortune.badge}
                        </div>
                      )}
                      
                      {/* Glow effect on hover */}
                      {fortune.isActive && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${fortune.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 blur-xl`} />
                      )}
                      
                      {/* Icon */}
                      <div className={`relative w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${fortune.gradient} flex items-center justify-center ${
                        fortune.isActive ? `group-hover:scale-110 group-hover:${fortune.glowColor} group-hover:shadow-lg` : ''
                      } transition-all duration-300`}>
                        <IconComponent className="w-7 h-7 text-white" strokeWidth={2} />
                      </div>
                      
                      {/* Title */}
                      <h3 className={`text-center text-sm font-bold transition-all duration-300 ${
                        fortune.isActive 
                          ? 'text-white group-hover:text-cyan-300' 
                          : 'text-white/40'
                      }`}>
                        {fortune.title}
                      </h3>
                      
                      {/* Sparkle effect */}
                      {fortune.isActive && (
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-lg">✨</span>
                        </div>
                      )}
                    </div>
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
