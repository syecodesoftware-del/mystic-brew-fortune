import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Moon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/fortune');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[hsl(258,90%,76%)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-radial from-[hsl(243,75%,59%)]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="w-full max-w-md text-center relative z-10">
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
            <img src={logo} alt="Falcan Logo" className="w-32 h-32 mx-auto animate-pulse-glow" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold text-[hsl(220,13%,18%)] mb-4 font-mystic">
            Falcan ✨
          </h1>
          
          <p className="text-xl text-[hsl(220,9%,46%)] mb-12 italic px-4">
            Can cana değil, Falcan'a ...
          </p>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(167,139,250,0.12)] mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-6 h-6 text-[hsl(43,96%,56%)]" />
              <Moon className="w-6 h-6 text-[hsl(258,90%,76%)]" />
              <Sparkles className="w-6 h-6 text-[hsl(258,90%,76%)]" />
            </div>
            
            <p className="text-[hsl(220,13%,18%)] mb-8 leading-relaxed">
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
                variant="secondary"
                className="w-full text-lg py-6 rounded-xl transition-all hover:scale-105"
                size="lg"
              >
                Üye Ol
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[hsl(220,9%,46%)] text-sm">
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
