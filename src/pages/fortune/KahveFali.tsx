import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FortuneTeller {
  id: number;
  name: string;
  cost: number;
  emoji: string;
  description: string;
}

const KahveFali = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fortuneTellers: FortuneTeller[] = [
    { 
      id: 1, 
      name: "Tecrübeli Falcı", 
      cost: 10, 
      emoji: "⭐", 
      description: "Hızlı ve öz yorumlar" 
    },
    { 
      id: 2, 
      name: "Usta Falcı", 
      cost: 25, 
      emoji: "🌟", 
      description: "Detaylı ve ilişki odaklı" 
    },
    { 
      id: 3, 
      name: "Mistik Falcı", 
      cost: 50, 
      emoji: "🔮", 
      description: "Ruhsal gelişim" 
    },
    { 
      id: 4, 
      name: "Aşk Falcısı", 
      cost: 40, 
      emoji: "💖", 
      description: "Sadece aşk ve ilişkiler" 
    },
    { 
      id: 5, 
      name: "Gelecek Falcısı", 
      cost: 75, 
      emoji: "✨", 
      description: "En detaylı yorum" 
    }
  ];
  
  const handleTellerClick = (teller: FortuneTeller) => {
    if (user && user.coins < teller.cost) {
      toast({
        title: "Yetersiz altın! 💰",
        description: `${teller.name} için ${teller.cost} altına ihtiyacın var. Şu an ${user.coins} altının var.`,
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/fortune/kahve/upload/${teller.id}`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Geri Butonu */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/fortune')}
            className="flex items-center gap-2 text-[hsl(220,13%,18%)] mb-6 hover:underline font-medium"
          >
            <ArrowLeft size={20} />
            Fal Türleri
          </motion.button>
          
          {/* Başlık */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-[hsl(220,13%,18%)] mb-2 font-display">
              ☕ Kahve Falcısını Seç
            </h1>
            <p className="text-[hsl(220,9%,46%)]">
              Sana en uygun falcıyı seç ve falına başla
            </p>
            {user && (
              <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(43,96%,56%)] to-[hsl(24,95%,61%)] text-white font-bold px-4 py-2 rounded-full shadow-lg">
                <Coins size={20} />
                <span>Bakiyen: {user.coins} altın</span>
              </div>
            )}
          </motion.div>
          
          {/* Falcı Kartları */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {fortuneTellers.map((teller) => {
              const canAfford = user && user.coins >= teller.cost;
              
              return (
                <motion.div
                  key={teller.id}
                  whileHover={canAfford ? { scale: 1.05 } : {}}
                  onClick={() => handleTellerClick(teller)}
                  className={`bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(167,139,250,0.12)] transition-all ${
                    canAfford 
                      ? 'cursor-pointer hover:shadow-[0_16px_48px_rgba(167,139,250,0.25)] hover:-translate-y-1' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="text-6xl text-center mb-4">{teller.emoji}</div>
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                    {teller.name}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {teller.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold py-2 px-4 rounded-full">
                    <span>💰</span>
                    <span>{teller.cost} altın</span>
                  </div>
                  {!canAfford && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      Yetersiz altın
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default KahveFali;
