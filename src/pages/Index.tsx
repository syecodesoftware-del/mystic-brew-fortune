import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';

interface FortuneType {
  type: string;
  title: string;
  description: string;
  emoji: string;
  isActive: boolean;
  badge?: string;
}

interface FortuneTypeCardProps extends FortuneType {
  onClick: () => void;
}

const FortuneTypeCard = ({ title, description, emoji, isActive, badge, onClick }: FortuneTypeCardProps) => {
  return (
    <motion.div
      onClick={isActive ? onClick : undefined}
      whileHover={isActive ? { scale: 1.05 } : {}}
      className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-600 hover:border-purple-500 hover:shadow-xl cursor-pointer' 
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
        }
      `}
    >
      {/* Badge (Yakında) */}
      {badge && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {badge}
        </div>
      )}
      
      {/* Emoji */}
      <div className="text-6xl mb-4 text-center">
        {emoji}
      </div>
      
      {/* Başlık */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        {title}
      </h3>
      
      {/* Açıklama */}
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
        {description}
      </p>
      
      {/* Aktif ise ok ikonu */}
      {isActive && (
        <div className="mt-4 text-center">
          <span className="text-purple-600 dark:text-purple-400 font-semibold">
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
      description: 'Türk kahvesi fincanından geleceğini keşfet',
      emoji: '☕',
      isActive: true
    },
    {
      type: 'tarot',
      title: 'Tarot Falı',
      description: 'Mistik tarot kartlarıyla yol haritanı çiz',
      emoji: '🎴',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'el',
      title: 'El Falı',
      description: 'Avuç içindeki çizgilerden geleceğini oku',
      emoji: '🤚',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'katina',
      title: 'Katina Falı',
      description: 'Eriyen mumdan mesajları al',
      emoji: '🕯️',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'yuz',
      title: 'Yüz Falı',
      description: 'Yüz hatlarından karakterini ve geleceğini keşfet',
      emoji: '👤',
      isActive: false,
      badge: 'Yakında'
    },
    {
      type: 'melek',
      title: 'Melek Kartları',
      description: 'Meleklerin mesajlarını dinle',
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Hangi Falı Görmek İstersin? ✨
            </h1>
            <p className="text-lg text-purple-100">
              Sana en uygun fal türünü seç ve geleceğini keşfet
            </p>
          </motion.div>
          
          {/* Fal Türleri Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto"
          >
            {fortuneTypes.map((fortune) => (
              <FortuneTypeCard 
                key={fortune.type} 
                {...fortune} 
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
