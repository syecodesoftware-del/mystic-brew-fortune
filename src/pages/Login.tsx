import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

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
    
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key as keyof FormData, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      return;
    }

    setLoading(true);

    try {
      const user = loginUser(formData.email, formData.password);
      updateUser(user);

      toast({
        title: "Hoş geldin! ✨",
        description: `${user.firstName}, tekrar görüşmek güzel`,
      });

      navigate('/fortune');
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Giriş başarısız",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass = "bg-card/50 border-2 text-foreground placeholder:text-muted-foreground transition-all";
    if (!touched[fieldName]) return baseClass;
    if (errors[fieldName]) return `${baseClass} border-destructive focus:border-destructive`;
    return `${baseClass} border-green-500 focus:border-green-500`;
  };

  return (
    <div className="min-h-screen bg-gradient-mystic flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-accent animate-pulse-glow" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground">Enerjine tekrar hoş geldin</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-card rounded-3xl p-8 shadow-mystic space-y-6">
          <div>
            <Label htmlFor="email" className="text-foreground flex items-center gap-2 mb-2">
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
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground flex items-center gap-2 mb-2">
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
              <p className="text-destructive text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl transition-all hover:scale-105"
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
            <p className="text-center text-muted-foreground text-sm">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-accent hover:underline font-medium">
                Üye Ol
              </Link>
            </p>
            <p className="text-center">
              <Link to="#" className="text-muted-foreground hover:text-accent text-sm transition-colors">
                Şifremi Unuttum
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
