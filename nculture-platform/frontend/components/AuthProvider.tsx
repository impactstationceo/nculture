'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, isSupabaseConfigured } from '@/lib/supabase';

// 데모 세션 저장 키
const DEMO_SESSION_KEY = 'nculture_demo_session';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'institution_admin' | 'platform_admin';
  status: 'pending' | 'approved' | 'rejected';
  isSupabaseUser?: boolean;
  plan?: string;
}

interface Wallet {
  balance: number;
  monthlyLimit?: number;
  used?: number;
}

interface AuthContextType {
  user: User | null;
  profile: User | null;
  wallet: Wallet;
  isLoggedIn: boolean;
  isLoading: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateCredits: (amount: number) => void;
  updatePlan: (plan: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet>({ balance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 초기 세션 확인
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Supabase 세션 확인
        if (isSupabaseConfigured) {
          const currentUser = await auth.getUser();
          if (currentUser) {
            const profileData = await auth.getProfile();
            const userData: User = {
              id: currentUser.id,
              email: currentUser.email || '',
              name: profileData?.name || currentUser.email?.split('@')[0] || 'User',
              role: profileData?.role || 'student',
              status: profileData?.status || 'approved',
              isSupabaseUser: true,
              plan: profileData?.plan || 'free',
            };
            setUser(userData);
            setWallet({ balance: profileData?.credits || 100 });
            setIsLoading(false);
            return;
          }
        }

        // 2. 데모 세션 확인 (로컬 스토리지)
        if (typeof window !== 'undefined') {
          const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
          if (savedSession) {
            try {
              const sessionData = JSON.parse(savedSession);
              // 24시간 이내 세션만 유효
              const savedAt = new Date(sessionData.savedAt);
              const now = new Date();
              const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
              
              if (hoursDiff < 24) {
                setUser(sessionData);
                setWallet({ balance: sessionData.credits || 100 });
              } else {
                localStorage.removeItem(DEMO_SESSION_KEY);
              }
            } catch (e) {
              localStorage.removeItem(DEMO_SESSION_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((userData: User) => {
    const userWithDefaults: User = {
      ...userData,
      id: userData.id || `demo_${Date.now()}`,
      plan: userData.plan || 'free',
    };
    
    setUser(userWithDefaults);
    setWallet({ balance: 100 });

    // 데모 모드인 경우 로컬 스토리지에 세션 저장
    if (!userData.isSupabaseUser && typeof window !== 'undefined') {
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
        ...userWithDefaults,
        credits: 100,
        savedAt: new Date().toISOString(),
      }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
    } catch (e) {
      // ignore
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(DEMO_SESSION_KEY);
    }
    
    setUser(null);
    setWallet({ balance: 0 });
  }, []);

  const updateCredits = useCallback((amount: number) => {
    setWallet(prev => {
      const newBalance = prev.balance + amount;
      
      // 데모 세션 업데이트
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            sessionData.credits = newBalance;
            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionData));
          } catch (e) {}
        }
      }
      
      return { ...prev, balance: newBalance };
    });
  }, []);

  const updatePlan = useCallback((plan: string) => {
    if (!user) return;
    
    const plans: Record<string, { credits: number; monthlyLimit: number }> = {
      free: { credits: 50, monthlyLimit: 50 },
      basic: { credits: 500, monthlyLimit: 500 },
      pro: { credits: 2000, monthlyLimit: 2000 },
      max: { credits: 5000, monthlyLimit: 5000 },
    };
    
    const planData = plans[plan] || plans.free;
    
    setUser(prev => prev ? { ...prev, plan } : null);
    setWallet(prev => ({ 
      ...prev, 
      balance: planData.credits,
      monthlyLimit: planData.monthlyLimit,
    }));
    
    // 데모 세션 업데이트
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem(DEMO_SESSION_KEY);
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          sessionData.plan = plan;
          sessionData.credits = planData.credits;
          localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(sessionData));
        } catch (e) {}
      }
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    profile: user, // alias
    wallet,
    isLoggedIn: !!user,
    isLoading,
    isInstructor: user?.role === 'instructor',
    isAdmin: user?.role === 'institution_admin' || user?.role === 'platform_admin',
    login,
    logout,
    updateCredits,
    updatePlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
