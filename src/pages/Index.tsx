import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';

interface FortuneType {
  type: string;
  title: string;
  emoji: string;
  isActive: boolean;
  badge?: string;
}

interface FortuneTypeCardProps extends FortuneType {
  onClick: () => void;
  index: number;
}

const FortuneTypeCard = ({ title, emoji, isActive, badge, onClick, index }: FortuneTypeCardProps) => {
  return (
    <motion.div
      onClick={isActive ? onClick : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={isActive ? { scale: 1.05 } : {}}
      className={`
        relative p-6 rounded-xl transition-all duration-300
        ${isActive 
          ? 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:shadow-2xl cursor-pointer' 
          : 'bg-white/5 backdrop-blur-sm border border-white/10 cursor-not-allowed opacity-50'
        }
      `}
    >
      {/* Badge (Yakında) - sadece pasif olanlarda */}
      {badge && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
          {badge}
        </div>
      )}
      
      {/* Emoji - Hareketli */}
      <motion.div 
        className="text-5xl mb-3 text-center"
        animate={isActive ? {
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
        {emoji}
      </motion.div>
      
      {/* Başlık */}
      <h3 className="text-lg font-bold text-white text-center">
        {title}
      </h3>
      
      {/* Aktif ise ok ikonu */}
      {isActive && (
        <div className="mt-3 text-center">
          <span className="text-purple-200 text-sm font-medium">
            Başla →
          </span>
        </div>
      )}
    </motion.div>
  );
};

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative">
      <MysticalBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 lg:py-12">
          {/* Başlık */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 lg:mb-12"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Hangi Falı Görmek İstersin? ✨
            </h1>
            <p className="text-base lg:text-lg text-purple-100">
              Sana en uygun fal türünü seç
            </p>
          </motion.div>
          
          {/* Fal Türleri Grid - Daha kompakt */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
          >
            {fortuneTypes.map((fortune, index) => (
              <FortuneTypeCard 
                key={fortune.type} 
                {...fortune}
                index={index}
                onClick={() => handleFortuneTypeClick(fortune.type)}
              />
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
