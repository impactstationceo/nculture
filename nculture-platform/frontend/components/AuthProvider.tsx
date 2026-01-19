'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { INSTITUTION_DATA, PRICING_PLANS } from '@/lib/data';
import { upgradePlan, updateProfile } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  isLoading: boolean;
  wallet: { balance: number };
  creditLedger: any[];
  userPlan: string;
  userEnterpriseTier: any;
  institution: any;
  viewMode: string | null;
  currentRole: string | null;
  currentPage: string;
  authMode: 'login' | 'signup' | 'institution_login' | 'institution_signup';
  showAuthModal: boolean;
  showUpgradeModal: boolean;
  upgradeReason: any;
  setWallet: React.Dispatch<React.SetStateAction<{ balance: number }>>;
  setUserPlan: React.Dispatch<React.SetStateAction<string>>;
  setUserEnterpriseTier: React.Dispatch<React.SetStateAction<any>>;
  setInstitution: React.Dispatch<React.SetStateAction<any>>;
  setAuthMode: React.Dispatch<React.SetStateAction<'login' | 'signup' | 'institution_login' | 'institution_signup'>>;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowUpgradeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpgradeReason: React.Dispatch<React.SetStateAction<any>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  addLedgerEntry: (entry: any) => void;
  handleAuthClick: (mode?: 'login' | 'signup' | 'institution_login' | 'institution_signup') => void;
  handleLogin: (userData: any) => Promise<void>;
  handleLogout: () => void;
  handleShowUpgradeModal: (reason: any) => void;
  handlePlanUpgrade: (newPlanId: string, enterpriseTier?: any) => Promise<void> | void;
  handleToggleRole: () => void;
  handleRoleSwitch: (newViewMode: string | null) => void;
  setCurrentPage: (page: string) => void;
  requireAuth: (action: () => void) => void;
  clearPendingAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const protectedPages = ['session', 'liveroom', 'assessment', 'dashboard', 'mypage', 'institution'];

const pageToPath: Record<string, string> = {
  main: '/',
  curriculum: '/curriculum',
  live: '/live',
  assessment: '/assessment',
  media: '/media',
  dashboard: '/dashboard',
  mypage: '/mypage',
  institution: '/institution',
};

const pathToPage = (path: string) => {
  if (path === '/') return 'main';
  if (path.startsWith('/curriculum')) return 'curriculum';
  if (path.startsWith('/courses/')) return 'courseDetail';
  if (path.startsWith('/session/')) return 'session';
  if (path === '/live') return 'live';
  if (path.startsWith('/live/')) return 'liveroom';
  if (path.startsWith('/assessment')) return 'assessment';
  if (path.startsWith('/media')) return 'media';
  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/mypage')) return 'mypage';
  if (path.startsWith('/institution')) return 'institution';
  return 'main';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPageState] = useState('main');
  const [currentSession] = useState(1);
  const [currentLiveClass] = useState<any>(null);
  const [currentCourse] = useState<any>(null);
  const [currentTest] = useState<any>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<string | null>(null);
  const [institution, setInstitution] = useState(INSTITUTION_DATA);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'institution_login' | 'institution_signup'>('login');
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [wallet, setWallet] = useState({ balance: 1000 });
  const [creditLedger, setCreditLedger] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState('pro');
  const [userEnterpriseTier, setUserEnterpriseTier] = useState<any>(null);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const currentRole = useMemo(() => viewMode || user?.role || null, [viewMode, user]);

  useEffect(() => {
    setCurrentPageState(pathToPage(pathname || '/'));
  }, [pathname]);

  const applyUserState = (nextUser: any, profile?: any) => {
    const mergedUser = {
      id: nextUser?.id || profile?.id,
      email: nextUser?.email || profile?.email,
      name: profile?.name || nextUser?.user_metadata?.name || nextUser?.email?.split('@')[0],
      role: profile?.role || nextUser?.user_metadata?.role || 'student',
      status: profile?.status || nextUser?.user_metadata?.status || 'approved',
      institutionId: profile?.institution_id || nextUser?.user_metadata?.institutionId || null
    };

    setUser(mergedUser);
    setIsLoggedIn(true);
    setViewMode(null);

    if (typeof profile?.credits === 'number') {
      setWallet({ balance: profile.credits });
    }
    if (profile?.plan) {
      setUserPlan(profile.plan);
    }
    if (profile?.enterprise_tier) {
      setUserEnterpriseTier(profile.enterprise_tier);
    }
  };

  useEffect(() => {
    let isActive = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('users_profile')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (isActive) {
              applyUserState(session.user, profile);
            }
          } else if (isActive) {
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          const saved = localStorage.getItem('demo_session');
          if (saved && isActive) {
            const demoUser = JSON.parse(saved);
            setUser(demoUser);
            setIsLoggedIn(true);
            if (typeof demoUser?.credits === 'number') {
              setWallet({ balance: demoUser.credits });
            }
            if (demoUser?.plan) {
              setUserPlan(demoUser.plan);
            }
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isActive = false;
    };
  }, []);

  const addLedgerEntry = (entry: any) => {
    setCreditLedger(prev => [entry, ...prev]);
  };

  const handleShowUpgradeModal = (reason: any) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handlePlanUpgrade = async (newPlanId: string, enterpriseTier: any = null) => {
    if (newPlanId === 'enterprise' && enterpriseTier) {
      setUserPlan('enterprise');
      setUserEnterpriseTier(enterpriseTier);
      setWallet({ balance: enterpriseTier.monthlyCredits || 999999 });
    } else {
      const newPlan = PRICING_PLANS[newPlanId];
      if (newPlan) {
        setUserPlan(newPlanId);
        setUserEnterpriseTier(null);
        setWallet({ balance: newPlan.monthlyCredits });
      }
    }
    setShowUpgradeModal(false);
    setUpgradeReason(null);

    if (isSupabaseConfigured && user?.id) {
      try {
        if (newPlanId === 'enterprise' && enterpriseTier) {
          await updateProfile(user.id, {
            plan: 'enterprise',
            credits: enterpriseTier.monthlyCredits || 999999,
            enterprise_tier: enterpriseTier
          });
        } else {
          await upgradePlan(user.id, newPlanId);
        }
      } catch (error) {
        console.error('Plan upgrade error:', error);
      }
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup' | 'institution_login' | 'institution_signup' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = async (userData: any) => {
    const { email, password, name, role, status, institutionId, action } = userData || {};

    if (!email || !password) {
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        if (action === 'signup') {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;

          const userId = data.user?.id;
          if (userId) {
            const profilePayload = {
              id: userId,
              email,
              name: name || email.split('@')[0],
              role: role || 'student',
              status: status || 'approved',
              credits: 100,
              plan: 'free',
              institution_id: institutionId || null
            };

            const { error: profileError } = await supabase
              .from('users_profile')
              .insert(profilePayload);
            if (profileError) throw profileError;

            applyUserState(data.user, profilePayload);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;

          const { data: profile } = await supabase
            .from('users_profile')
            .select('*')
            .eq('id', data.user?.id)
            .single();

          applyUserState(data.user, profile);
        }
      } else {
        const demoUser = {
          id: 'demo',
          email,
          name: name || email.split('@')[0],
          role: role || 'student',
          status: status || 'approved',
          institutionId: institutionId || null,
          credits: action === 'signup' ? 100 : 1000,
          plan: action === 'signup' ? 'free' : userPlan
        };

        setUser(demoUser);
        setIsLoggedIn(true);
        setViewMode(null);
        setWallet({ balance: demoUser.credits });
        if (demoUser.plan) {
          setUserPlan(demoUser.plan);
        }
        localStorage.setItem('demo_session', JSON.stringify(demoUser));
      }

      setShowAuthModal(false);

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(`로그인 실패: ${error.message || '인증 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch((error) => {
        console.error('Logout error:', error);
      });
    } else {
      localStorage.removeItem('demo_session');
    }
    setUser(null);
    setIsLoggedIn(false);
    setViewMode(null);
    setCurrentPageState('main');
    router.push('/');
  };

  const requireAuth = (action: () => void) => {
    if (!isLoggedIn) {
      setPendingAction(() => action);
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    action();
  };

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  const handleToggleRole = () => {
    if (user?.role === 'instructor' && user?.status === 'approved') {
      setViewMode(prev => prev === 'student' ? null : 'student');
    } else if (user?.role === 'institution_admin') {
      setViewMode(prev => {
        if (!prev) return 'instructor';
        if (prev === 'instructor') return 'student';
        return null;
      });
    }
  };
  
  const handleRoleSwitch = (newViewMode: string | null) => {
    setViewMode(newViewMode);
  };

  const setCurrentPage = (page: string) => {
    const path = pageToPath[page];
    if (!path) {
      setCurrentPageState(page);
      return;
    }
    if (protectedPages.includes(page) && !isLoggedIn) {
      setPendingAction(() => () => router.push(path));
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setCurrentPageState(page);
    router.push(path);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    wallet,
    creditLedger,
    userPlan,
    userEnterpriseTier,
    institution,
    viewMode,
    currentRole,
    currentPage,
    authMode,
    showAuthModal,
    showUpgradeModal,
    upgradeReason,
    setWallet,
    setUserPlan,
    setUserEnterpriseTier,
    setInstitution,
    setAuthMode,
    setShowAuthModal,
    setShowUpgradeModal,
    setUpgradeReason,
    setUser,
    addLedgerEntry,
    handleAuthClick,
    handleLogin,
    handleLogout,
    handleShowUpgradeModal,
    handlePlanUpgrade,
    handleToggleRole,
    handleRoleSwitch,
    setCurrentPage,
    requireAuth,
    clearPendingAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
