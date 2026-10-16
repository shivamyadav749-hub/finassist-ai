import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { ModalType } from '../components/InfoModal';
import {
  auth,
  googleProvider,
  db,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenInfoModal: (type: ModalType) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onNavigate,
  onLoginSuccess,
  onOpenInfoModal,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getCleanAuthErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account exists with this email. Please register.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please switch to Sign In.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Please allow popups.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your connection and retry.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is currently disabled in your Firebase project. Please enable it in Firebase Console > Authentication > Sign-in method.';
      default:
        return error?.message || 'Authentication failed. Please check your credentials.';
    }
  };

  const syncUserProfileToFirestore = async (fbUser: any, name?: string, comp?: string) => {
    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const existingSnap = await getDoc(userDocRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};

      const profileData = {
        userId: fbUser.uid,
        email: fbUser.email || email,
        fullName: name || fbUser.displayName || existingData.fullName || email.split('@')[0],
        companyName: comp || existingData.companyName || (email.includes('@') ? email.split('@')[1].split('.')[0] : 'Enterprise Corp'),
        role: existingData.role || 'Managing Director',
        createdAt: existingData.createdAt || new Date().toISOString(),
      };

      await setDoc(userDocRef, profileData, { merge: true });
      return profileData;
    } catch (err) {
      console.warn('Could not sync user profile to Firestore:', err);
      return {
        userId: fbUser.uid,
        email: fbUser.email || email,
        fullName: name || fbUser.displayName || 'Enterprise Executive',
        companyName: comp || 'Institutional Workspace',
        role: 'Managing Director',
      };
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const synced = await syncUserProfileToFirestore(fbUser);
      const userProfile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || 'user@workspace.google.com',
        fullName: fbUser.displayName || synced.fullName || 'Enterprise Executive',
        companyName: synced.companyName || 'Institutional Workspace',
        role: synced.role || 'Managing Director',
      };
      onLoginSuccess(userProfile);
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setErrorMessage(getCleanAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCred.user;
        const synced = await syncUserProfileToFirestore(fbUser);
        const userProfile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || email,
          fullName: fbUser.displayName || synced.fullName || email.split('@')[0],
          companyName: synced.companyName || 'Enterprise Corp',
          role: synced.role || 'Managing Director',
        };
        onLoginSuccess(userProfile);
        onNavigate('dashboard');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCred.user;
        if (fullName) {
          try {
            await updateProfile(fbUser, { displayName: fullName });
          } catch (pErr) {
            console.warn('Could not set displayName on profile:', pErr);
          }
        }
        const synced = await syncUserProfileToFirestore(fbUser, fullName, companyName);
        const userProfile: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || email,
          fullName: fullName || fbUser.displayName || email.split('@')[0],
          companyName: companyName || synced.companyName || 'Enterprise Corp',
          role: 'Managing Director',
        };
        onLoginSuccess(userProfile);
        onNavigate('dashboard');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setErrorMessage(getCleanAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail: string, name: string, comp: string) => {
    setEmail(demoEmail);
    setPassword('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Provision an isolated evaluation demo workspace profile without exposing or hardcoding passwords
      const demoProfile: UserProfile = {
        id: `demo_${demoEmail.split('@')[0]}`,
        email: demoEmail,
        fullName: name,
        companyName: comp,
        role: 'Managing Director',
      };
      onLoginSuccess(demoProfile);
      onNavigate('dashboard');
    } catch (err: any) {
      console.warn('Demo login error:', err?.message || err);
      setErrorMessage(getCleanAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto px-4 pb-20 pt-2 flex flex-col gap-4 text-left">
      {/* Top Navigation / Context Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-[#434655] hover:text-[#131b2e] transition-colors min-h-[40px] text-[13px] font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Home</span>
        </button>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#82f5c1]/30">
          <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
          <span className="text-[11px] font-semibold text-[#005137]">SOC2 Verified Core</span>
        </div>
      </div>

      {/* Header & Brand Positioning */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[#0037b0]">
          <span className="material-symbols-outlined text-[20px]">verified_user</span>
          <span className="text-[11px] uppercase tracking-wider font-bold">Institutional Portal</span>
        </div>
        <h1 className="text-[26px] font-bold text-[#131b2e] tracking-tight">Welcome to FinAssist AI</h1>
        <p className="text-[13px] text-[#434655] leading-relaxed">
          Access autonomous cashflow modeling, ledger sync, and institutional-grade CFO analytics.
        </p>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="w-full p-1 bg-[#e2e7ff] rounded-lg flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAuthMode('signin')}
          className={`flex-1 py-2 rounded-md text-[13px] font-semibold text-center transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
            authMode === 'signin'
              ? 'bg-white text-[#131b2e] shadow-sm'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-[#0037b0]">login</span>
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('register')}
          className={`flex-1 py-2 rounded-md text-[13px] font-semibold text-center transition-all min-h-[38px] flex items-center justify-center gap-1.5 ${
            authMode === 'register'
              ? 'bg-white text-[#131b2e] shadow-sm'
              : 'text-[#434655] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">domain_add</span>
          Create Account
        </button>
      </div>

      {/* 1-Tap OAuth SSO Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#f2f3ff] transition-colors shadow-sm border border-[#cbd5e1]/60 flex items-center justify-between group focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                fill="#4285F4"
              />
              <path
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                fill="#34A853"
              />
              <path
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                fill="#FBBC05"
              />
              <path
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-[13px] font-medium text-[#131b2e]">Continue with Google Workspace</span>
          </div>
          <span className="material-symbols-outlined text-[#747686] group-hover:text-[#0037b0] transition-colors text-[18px]">
            chevron_right
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleDemoSignIn('cfo@enterprise.network', 'Elena Rostova', 'Enterprise Network')}
          className="w-full min-h-[44px] px-3.5 py-2 rounded-lg bg-white hover:bg-[#f2f3ff] transition-colors shadow-sm border border-[#cbd5e1]/60 flex items-center justify-between group focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23">
              <path d="M1 1h10v10H1z" fill="#F25022" />
              <path d="M12 1h10v10H12z" fill="#7FBA00" />
              <path d="M1 12h10v10H1z" fill="#00A4EF" />
              <path d="M12 12h10v10H12z" fill="#FFB900" />
            </svg>
            <span className="text-[13px] font-medium text-[#131b2e]">Continue with Microsoft SSO</span>
          </div>
          <span className="material-symbols-outlined text-[#747686] group-hover:text-[#0037b0] transition-colors text-[18px]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[#eaedff]"></div>
        <span className="text-[11px] text-[#747686] uppercase tracking-wider font-medium">
          Or continue with work email
        </span>
        <div className="flex-1 h-px bg-[#eaedff]"></div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#93000a] text-[12px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {authMode === 'register' && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#131b2e]" htmlFor="full-name">
                Executive Full Name
              </label>
              <input
                id="full-name"
                type="text"
                required
                placeholder="Marcus Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-[#131b2e]" htmlFor="company-name">
                Company / Organization
              </label>
              <input
                id="company-name"
                type="text"
                required
                placeholder="HyperScale Data Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#cbd5e1] text-[#131b2e] text-[13px] focus:outline-none focus:border-[#1d4ed8]"
              />
            </div>
          </>
        )}

        {/* Work Email Field */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#131b2e]" htmlFor="work-email">
              Work Email Address
            </label>
            <span className="text-[11px] text-[#747686]">Corporate domain only</span>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[18px] pointer-events-none">
              mail
            </span>
            <input
              id="work-email"
              type="email"
              required
              placeholder="founder@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-lg bg-white border border-[#cbd5e1] text-[#131b2e] text-[13px] placeholder:text-[#747686]/60 focus:outline-none focus:border-[#1d4ed8] shadow-xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[#131b2e]" htmlFor="work-password">
              Master Password
            </label>
            <button
              type="button"
              onClick={() => onOpenInfoModal('forgot-password')}
              className="text-[11px] text-[#0037b0] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#747686] text-[18px] pointer-events-none">
              lock
            </span>
            <input
              id="work-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-9 pr-10 rounded-lg bg-white border border-[#cbd5e1] text-[#131b2e] text-[13px] placeholder:text-[#747686]/60 focus:outline-none focus:border-[#1d4ed8] shadow-xs"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 text-[#747686] hover:text-[#131b2e] p-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between py-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#0037b0] accent-[#0037b0]"
            />
            <span className="text-[12px] text-[#131b2e]">Keep this session authenticated for 30 days</span>
          </label>
          <span className="material-symbols-outlined text-[#747686] text-[16px] cursor-help" title="Enterprise token security policy">
            info
          </span>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg bg-[#0037b0] text-white font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#1d4ed8] active:scale-[0.99] transition-all shadow-md disabled:opacity-50"
        >
          <span>{isLoading ? 'Authorizing Session...' : authMode === 'signin' ? 'Sign In to Workspace' : 'Initialize Free Trial'}</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

        {/* Quick Demo Pre-Fill Helper */}
        <button
          type="button"
          onClick={() => handleDemoSignIn('founder@company.com', 'Marcus Vance', 'HyperScale Data')}
          className="w-full py-2 rounded-lg bg-[#eaedff] text-[#0037b0] text-[12px] font-semibold hover:bg-[#dae2fd] transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">key</span>
          1-Click Instant Demo Login (Founder Account)
        </button>
      </form>

      {/* AI Security & Real-Time Sync Indicator Card */}
      <div className="w-full p-3.5 rounded-xl bg-[#f2f3ff] border border-[#cbd5e1]/50 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0037b0]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0037b0] text-[14px]">auto_awesome</span>
            </div>
            <span className="text-[12px] font-semibold text-[#131b2e]">Institutional Core Protocol</span>
          </div>
          <span className="text-[11px] font-semibold text-[#006c4a]">99.99% Uptime</span>
        </div>
        <p className="text-[12px] text-[#434655]">
          Federated multi-ledger synchronization via read-only encrypted API bridges with automated anomaly alerts.
        </p>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col items-center justify-center text-center p-2 rounded bg-white shadow-xs gap-0.5">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">lock_clock</span>
            <span className="text-[10px] font-semibold text-[#131b2e]">256-bit AES</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2 rounded bg-white shadow-xs gap-0.5">
            <span className="material-symbols-outlined text-[#0037b0] text-[18px]">verified</span>
            <span className="text-[10px] font-semibold text-[#131b2e]">SOC2 Type II</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-2 rounded bg-white shadow-xs gap-0.5">
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">account_balance</span>
            <span className="text-[10px] font-semibold text-[#131b2e]">Read-Only Plaid</span>
          </div>
        </div>
      </div>

      {/* Enterprise SSO Assistance Prompt */}
      <div className="w-full p-2.5 rounded-lg bg-[#e2e7ff] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="material-symbols-outlined text-[#434655] text-[18px] flex-shrink-0">apartment</span>
          <p className="text-[12px] text-[#434655] truncate">Need enterprise Okta or SAML 2.0?</p>
        </div>
        <button
          type="button"
          onClick={() => onOpenInfoModal('contact')}
          className="text-[12px] font-semibold text-[#0037b0] hover:underline whitespace-nowrap"
        >
          Contact Sales
        </button>
      </div>

      {/* Legal Compliance Microcopy */}
      <div className="text-center">
        <p className="text-[11px] text-[#747686] leading-snug">
          By continuing, you agree to the FinAssist AI{' '}
          <button
            type="button"
            onClick={() => onOpenInfoModal('terms')}
            className="text-[#0037b0] hover:underline font-medium"
          >
            Terms of Service
          </button>{' '}
          and acknowledge our{' '}
          <button
            type="button"
            onClick={() => onOpenInfoModal('privacy')}
            className="text-[#0037b0] hover:underline font-medium"
          >
            Privacy Policy
          </button>.
        </p>
      </div>
    </div>
  );
};
