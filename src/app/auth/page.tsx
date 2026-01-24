"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/shared/lib/supabase/client';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!loading && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      setIsRedirecting(true);
      
      // Debounce redirect para prevenir múltiplas navegações
      const timer = setTimeout(() => {
        router.push('/');
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-zinc-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">
            {isRedirecting ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-white/10">
            <Image src="/favicon.png" alt="Velura Logo" width={24} height={24} priority />
          </div>
          <span className="text-3xl font-bold tracking-tight text-zinc-100">Velura</span>
        </div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Sign in to start creating amazing landing pages
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#71717a',
                    brandAccent: '#52525b',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 rounded-lg font-medium transition-colors',
                input: 'w-full px-3 py-2 bg-zinc-800 border border-white/10 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600',
              },
            }}
            theme="dark"
            providers={['google', 'github']}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          />
        </motion.div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
