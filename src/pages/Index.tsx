import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';

interface FortuneType {
  type: string;
  title: string;
  emoji: string;
  isActive: boolean;
  badge?: string;
}

const Index = () => {
  const navigate = useNavigate();
  
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
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Arkaplan Görseli */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: "url('/images/mystical-home-bg.jpg')",
          filter: "blur(2px)"
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-primary/50 rounded-full animate-bounce" />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-primary rounded-full animate-ping" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-20">
          {/* Logo/Başlık */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-white text-7xl lg:text-8xl font-bold font-handwriting mb-4 text-glow drop-shadow-[0_0_30px_rgba(162,89,255,0.5)]">
              Falcan
            </h1>
            <p className="text-white/60 text-lg font-display">
              Geleceğini keşfet, kaderini öğren
            </p>
          </motion.div>
          
          {/* Fal Türleri Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {fortuneTypes.map((fortune, index) => (
              <motion.div
                key={fortune.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => fortune.isActive && handleFortuneTypeClick(fortune.type)}
                className={`
                  group relative rounded-2xl p-8 cursor-pointer
                  transition-all duration-500 hover:scale-105
                  ${fortune.isActive 
                    ? 'glass glass-hover shadow-[0_8px_32px_0_rgba(162,89,255,0.15)]' 
                    : 'bg-white/[0.02] border border-white/10 opacity-50 cursor-not-allowed'
                  }
                `}
                whileHover={fortune.isActive ? { scale: 1.05 } : {}}
              >
                {/* Badge */}
                {fortune.badge && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-pulse">
                    {fortune.badge}
                  </div>
                )}
                
                {/* Emoji - Animasyonlu */}
                <motion.div 
                  className="text-7xl mb-4 text-center transform group-hover:scale-110 transition-transform duration-300"
                  animate={fortune.isActive ? {
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                >
                  {fortune.emoji}
                </motion.div>
                
                {/* Başlık */}
                <h3 className="text-white text-xl font-bold text-center mb-2 font-display">
                  {fortune.title}
                </h3>
                
                {/* Ok İkonu (Aktif ise) */}
                {fortune.isActive && (
                  <div className="text-center mt-3">
                    <span className="text-primary/80 text-sm font-medium group-hover:text-primary transition-colors">
                      Başla →
                    </span>
                  </div>
                )}
                
                {/* Glow efekti */}
                {fortune.isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
