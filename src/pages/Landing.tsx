import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import SpaceBackground from '@/components/SpaceBackground';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/fortune');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <SpaceBackground />
      
      <div className="w-full max-w-md text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <div className="text-8xl mb-4">✨</div>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-4 font-mystic gradient-text">
            Mistik Fal
          </h1>
          
          <p className="text-xl text-white/70 mb-12 italic px-4">
            Profesyonel Fal Uygulaması
          </p>

          <div className="card-mystical p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6 text-4xl">
              <span>🌙</span>
              <span>⭐</span>
              <span>✨</span>
            </div>
            
            <p className="text-white/90 mb-8 leading-relaxed">
              AI destekli profesyonel falcılarla geleceğini keşfet
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full text-lg py-6"
                size="lg"
              >
                Giriş Yap
              </Button>
              
              <Button
                onClick={() => navigate('/register')}
                variant="secondary"
                className="w-full text-lg py-6"
                size="lg"
              >
                Üye Ol
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Enerjini keşfet, falını öğren</span>
            <Sparkles className="w-4 h-4" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
