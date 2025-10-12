import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MysticalBackground from '@/components/MysticalBackground';

interface ComingSoonProps {
  type: string;
  emoji?: string;
}

const ComingSoon = ({ type, emoji = "🔮" }: ComingSoonProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 relative">
      <MysticalBackground />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4 max-w-2xl mx-auto"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="text-8xl mb-6"
            >
              {emoji}
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {type}
            </h1>
            
            <p className="text-xl text-purple-100 mb-8">
              Çok yakında seninle! ✨
            </p>
            
            <p className="text-purple-200 mb-12 max-w-md mx-auto">
              Bu özellik üzerinde çalışıyoruz. Şimdilik diğer fal türlerini deneyebilirsin.
            </p>
            
            <Button
              onClick={() => navigate('/fortune')}
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold px-8 py-6 rounded-full text-lg transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Fal Türlerine Dön
            </Button>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ComingSoon;
