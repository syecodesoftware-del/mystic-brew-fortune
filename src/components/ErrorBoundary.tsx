import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(252,100%,99%)] via-[hsl(252,100%,95%)] to-[hsl(252,100%,92%)] p-4">
          <div className="max-w-md w-full text-center bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(167,139,250,0.12)]">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-[hsl(220,13%,18%)] mb-2">
              Bir Hata Oluştu
            </h1>
            <p className="text-[hsl(220,9%,46%)] mb-6">
              Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-[hsl(258,90%,76%)] to-[hsl(243,75%,59%)] text-white font-semibold"
            >
              Sayfayı Yenile
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
