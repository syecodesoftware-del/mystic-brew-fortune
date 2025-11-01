import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import SpaceBackground from '@/components/SpaceBackground';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FortuneTeller {
  id: number;
  name: string;
  cost: number;
  emoji: string;
  description: string;
}

const CiftFali = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const fortuneTellers: FortuneTeller[] = [
    { 
      id: 1, 
      name: "Temel Çift Okuyucu", 
      cost: 40, 
      emoji: "💑", 
      description: "Temel uyumluluk analizi" 
    },
    { 
      id: 2, 
      name: "Aşk Uyumluluk Uzmanı", 
      cost: 55, 
      emoji: "💖", 
      description: "Detaylı aşk uyumluluğu" 
    },
    { 
      id: 3, 
      name: "İlişki Danışmanı", 
      cost: 70, 
      emoji: "💞", 
      description: "Kapsamlı ilişki analizi" 
    },
    { 
      id: 4, 
      name: "Astrolojik Çift Analisti", 
      cost: 85, 
      emoji: "⭐", 
      description: "Burç ve astroloji tabanlı" 
    },
    { 
      id: 5, 
      name: "Master İlişki Rehberi", 
      cost: 100, 
      emoji: "✨", 
      description: "En detaylı çift analizi" 
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
    
    navigate(`/fortune/ask/form/${teller.id}`);
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SpaceBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Geri Butonu */}
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/fortune')}
            className="flex items-center gap-2 text-white mb-6 hover:text-pink-300 transition-colors font-medium"
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
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 font-display">
              💕 Çift Falcısını Seç
            </h1>
            <p className="text-white/70">
              İlişkinizin gizemli dünyasını keşfedin
            </p>
            {user && (
              <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold px-4 py-2 rounded-full shadow-lg">
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
                  className={`card-mystical p-6 transition-all ${
                    canAfford 
                      ? 'cursor-pointer hover:shadow-[0_25px_50px_-12px_rgba(236,72,153,0.4)] hover:-translate-y-1' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="text-6xl text-center mb-4">{teller.emoji}</div>
                  <h3 className="text-xl font-bold text-center text-white mb-2">
                    {teller.name}
                  </h3>
                  <p className="text-sm text-white/70 text-center mb-4">
                    {teller.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-2 px-4 rounded-full">
                    <Coins size={18} />
                    <span>{teller.cost} altın</span>
                  </div>
                  {!canAfford && (
                    <p className="text-xs text-red-400 text-center mt-2">
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

export default CiftFali;
