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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
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
            
            <h1 className="text-4xl lg:text-5xl font-bold text-[hsl(220,13%,18%)] mb-4 font-display">
              {type}
            </h1>
            
            <p className="text-xl text-[hsl(220,9%,46%)] mb-8">
              Çok yakında seninle! ✨
            </p>
            
            <p className="text-[hsl(220,9%,46%)] mb-12 max-w-md mx-auto">
              Bu özellik üzerinde çalışıyoruz. Şimdilik diğer fal türlerini deneyebilirsin.
            </p>
            
            <Button
              onClick={() => navigate('/fortune')}
              className="bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] text-white hover:shadow-[0_8px_32px_rgba(167,139,250,0.5)] font-bold px-8 py-6 rounded-2xl text-lg transition-all hover:scale-105 hover:-translate-y-0.5"
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
