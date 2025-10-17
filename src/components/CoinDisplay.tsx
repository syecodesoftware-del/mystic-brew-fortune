import { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const CoinDisplay = () => {
  const [coins, setCoins] = useState(0);

  const updateCoins = async () => {
    const user = await getCurrentUser();
    if (user) setCoins(user.coins || 0);
  };

  useEffect(() => {
    updateCoins();
    
    window.addEventListener('storage', updateCoins);
    window.addEventListener('coinsUpdated', updateCoins);
    
    return () => {
      window.removeEventListener('storage', updateCoins);
      window.removeEventListener('coinsUpdated', updateCoins);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-white font-bold shadow-lg hover:scale-105 transition-transform">
      <Coins className="w-5 h-5" />
      <span>{coins}</span>
    </div>
  );
};

export default CoinDisplay;
