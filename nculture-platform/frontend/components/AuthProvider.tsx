'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { INSTITUTION_DATA, PRICING_PLANS } from '@/lib/data';

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
  authMode: string;
  showAuthModal: boolean;
  showUpgradeModal: boolean;
  upgradeReason: any;
  setWallet: React.Dispatch<React.SetStateAction<{ balance: number }>>;
  setUserPlan: React.Dispatch<React.SetStateAction<string>>;
  setUserEnterpriseTier: React.Dispatch<React.SetStateAction<any>>;
  setInstitution: React.Dispatch<React.SetStateAction<any>>;
  setAuthMode: React.Dispatch<React.SetStateAction<string>>;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowUpgradeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setUpgradeReason: React.Dispatch<React.SetStateAction<any>>;
  addLedgerEntry: (entry: any) => void;
  handleAuthClick: (mode?: string) => void;
  handleLogin: (userData: any) => void;
  handleLogout: () => void;
  handleShowUpgradeModal: (reason: any) => void;
  handlePlanUpgrade: (newPlanId: string, enterpriseTier?: any) => void;
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
  
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [user, setUser] = useState({ 
    id: 'user_001',
    email: 'test@test.com', 
    name: '테스트',
    role: 'instructor',
    status: 'approved',
    institutionId: null
  });
  const [viewMode, setViewMode] = useState<string | null>(null);
  const [institution, setInstitution] = useState(INSTITUTION_DATA);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const [wallet, setWallet] = useState({ balance: 1000 });
  const [creditLedger, setCreditLedger] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState('pro');
  const [userEnterpriseTier, setUserEnterpriseTier] = useState<any>(null);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<any>(null);

  const [isLoading] = useState(false);

  const currentRole = useMemo(() => viewMode || user?.role || null, [viewMode, user]);

  useEffect(() => {
    setCurrentPageState(pathToPage(pathname || '/'));
  }, [pathname]);

  const addLedgerEntry = (entry: any) => {
    setCreditLedger(prev => [entry, ...prev]);
  };

  const handleShowUpgradeModal = (reason: any) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  };

  const handlePlanUpgrade = (newPlanId: string, enterpriseTier: any = null) => {
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
  };

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogin = (userData: any) => {
    setUser({
      id: 'user_' + Date.now(),
      email: userData.email,
      name: userData.name,
      role: userData.role || 'instructor',
      status: userData.status || 'approved',
      institutionId: userData.institutionId || null
    });
    setIsLoggedIn(true);
    setShowAuthModal(false);
    setViewMode(null);
    
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleLogout = () => {
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
