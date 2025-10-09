import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Sparkles, Moon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/fortune');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-mystic flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="mb-8"
          >
            <Coffee className="w-32 h-32 mx-auto text-accent animate-pulse-glow" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-4">
            Falcan ✨
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 italic px-4">
            Can cana değil, Falcan'a ...
          </p>

          <div className="bg-gradient-card rounded-3xl p-8 shadow-mystic mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-6 h-6 text-accent" />
              <Moon className="w-6 h-6 text-secondary" />
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            
            <p className="text-foreground mb-8 leading-relaxed">
              Telvenin içindeki sembolleri okuyalım, geleceğine ışık tutalım
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl transition-all hover:scale-105"
                size="lg"
              >
                Giriş Yap
              </Button>
              
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full border-2 border-accent/50 text-foreground hover:bg-accent/10 hover:border-accent text-lg py-6 rounded-xl transition-all hover:scale-105"
                size="lg"
              >
                Üye Ol
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
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
