import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import SpaceBackground from '@/components/SpaceBackground';
import logo from '@/assets/logo.png';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'E-posta gerekli';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta girin';
        break;
      case 'password':
        if (!value) return 'Şifre gerekli';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Hata",
        description: "E-posta ve şifre gerekli",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await loginUser(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "✨ Giriş başarılı!",
          description: "Yönlendiriliyorsunuz...",
        });
        setTimeout(() => {
          navigate('/fortune');
        }, 500);
      } else {
        toast({
          title: "Hata",
          description: result.error || 'E-posta veya şifre hatalı',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || 'Giriş başarısız',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass = "bg-white/10 border-2 text-white placeholder:text-white/50 transition-all";
    if (!touched[fieldName]) return baseClass;
    if (errors[fieldName]) return `${baseClass} border-red-400 focus:border-red-400`;
    return `${baseClass} border-green-400 focus:border-green-400`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <SpaceBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="Falcan Logo" className="w-16 h-16 mx-auto mb-4 drop-shadow-2xl" />
          <h1 className="text-4xl font-bold text-white mb-2 font-mystic gradient-text">Giriş Yap</h1>
          <p className="text-white/70">Enerjine tekrar hoş geldin</p>
        </div>

        <form onSubmit={handleSubmit} className="card-mystical p-8 space-y-6">
          <div>
            <Label htmlFor="email" className="text-white flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              E-posta
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="E-posta adresiniz"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName('email')}
            />
            {touched.email && errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-white flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Şifre
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-6 rounded-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                Giriş yapılıyor...
              </span>
            ) : (
              'Giriş Yap'
            )}
          </Button>

          <div className="space-y-3">
            <p className="text-center text-white/70 text-sm">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-cyan-300 hover:underline font-medium">
                Üye Ol
              </Link>
            </p>
            <p className="text-center">
              <Link to="#" className="text-white/70 hover:text-cyan-300 text-sm transition-colors">
                Şifremi Unuttum
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
