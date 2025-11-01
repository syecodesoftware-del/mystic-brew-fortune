import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Brain, Sparkles, Star } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';

const fortuneTellers = [
  {
    id: 1,
    name: 'Temel Rüya Okuyucu',
    icon: '🌙',
    price: 25,
    description: 'Rüyanızın temel anlamını keşfedin'
  },
  {
    id: 2,
    name: 'Psikolojik Rüya Analisti',
    icon: '🧠',
    price: 40,
    description: 'Rüyanızın psikolojik derinliğine inin'
  },
  {
    id: 3,
    name: 'Sembolik Rüya Uzmanı',
    icon: '🔮',
    price: 55,
    description: 'Sembollerin gizli mesajlarını çözün'
  },
  {
    id: 4,
    name: 'Ruhsal Rüya Rehberi',
    icon: '✨',
    price: 70,
    description: 'Rüyanızın ruhani boyutunu keşfedin'
  },
  {
    id: 5,
    name: 'Master Rüya Yorumcusu',
    icon: '🌟',
    price: 90,
    description: 'Kapsamlı ve detaylı rüya analizi'
  }
];

const RuyaYorumu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCoins(user.coins || 0);
      }
    };
    loadUser();

    const handleCoinsUpdate = () => loadUser();
    window.addEventListener('coinsUpdated', handleCoinsUpdate);
    return () => window.removeEventListener('coinsUpdated', handleCoinsUpdate);
  }, []);

  const handleSelectTeller = (teller: typeof fortuneTellers[0]) => {
    if (coins < teller.price) {
      toast({
        title: "Yetersiz Bakiye",
        description: `Bu yorumcu için ${teller.price} altın gerekiyor. Mevcut bakiyeniz: ${coins} altın`,
        variant: "destructive"
      });
      return;
    }
    navigate(`/fortune/dream-interpretation/form/${teller.id}`);
  };

  return (
    <div className="min-h-screen relative">
      <MysticalBackground />
      <Header />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Moon className="w-16 h-16 text-purple-400 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Rüya Yorumu
            </h1>
            <p className="text-purple-200 text-lg">
              Rüyanızın gizli mesajlarını keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {fortuneTellers.map((teller, index) => (
              <Card
                key={teller.id}
                className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleSelectTeller(teller)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{teller.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {teller.name}
                      </h3>
                      <p className="text-purple-200 text-sm">
                        {teller.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg mb-2">
                      <span>{teller.price}</span>
                      <span>💰</span>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTeller(teller);
                      }}
                    >
                      Seç
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/fortune')}
              className="border-purple-500/50 text-purple-200 hover:bg-purple-500/20"
            >
              Geri Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuyaYorumu;
