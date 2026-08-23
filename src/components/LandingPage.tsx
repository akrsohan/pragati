import React, { useState, useEffect } from 'react';
import { RefreshCcw, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

interface LandingPageProps {
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  authEmail: string;
  setAuthEmail: (email: string) => void;
  authPassword: string;
  setAuthPassword: (pass: string) => void;
  authName: string;
  setAuthName: (name: string) => void;
  authLoading: boolean;
  authError: string | null;
  setAuthError?: (error: string | null) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
  onForgotPassword?: (email: string) => Promise<void>;
  onSendMagicLink?: (email: string) => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authName,
  setAuthName,
  authLoading,
  authError,
  setAuthError,
  handleAuthSubmit,
  onForgotPassword,
  onSendMagicLink
}) => {
  const [formMode, setFormMode] = useState<'login' | 'signup' | 'forgot'>(authMode);
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setFormMode(authMode);
  }, [authMode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const switchMode = (mode: 'login' | 'signup' | 'forgot') => {
    setFormMode(mode);
    setIsResetSent(false);
    setResetMessage(null);
    if (setAuthError) {
      setAuthError(null);
    }
    if (mode === 'login' || mode === 'signup') {
      setAuthMode(mode);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'forgot' && onForgotPassword) {
      if (cooldown > 0) return;
      try {
        await onForgotPassword(authEmail);
        setIsResetSent(true);
        setResetMessage('📧 Password reset email has been sent! Check your inbox (and spam folder).');
        setCooldown(60);
      } catch (err: any) {
        setCooldown(55);
      }
      return;
    }
    handleAuthSubmit(e);
  };

  const handleMagicLink = async () => {
    if (!authEmail.trim()) {
      if (setAuthError) setAuthError('Please enter your email address first.');
      return;
    }
    if (cooldown > 0) return;
    if (onSendMagicLink) {
      try {
        await onSendMagicLink(authEmail);
        setIsResetSent(true);
        setResetMessage('✨ 1-Click Magic Login link sent to your email! Click the link in your inbox to log in.');
        setCooldown(60);
      } catch (err: any) {
        setCooldown(55);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#07080d] text-[#e8ecff] flex flex-col items-center justify-center relative p-2 sm:p-4 md:p-6 overflow-y-auto select-none font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        :root{
          --bg:#07080d;
          --panel:#0d0f18;
          --cyan:#37f0ff;
          --violet:#8b5cff;
          --pink:#ff3d9a;
          --text:#e8ecff;
          --muted:#6b7290;
        }

        .stage{
          position:relative;
          width:880px;
          max-width:calc(100vw - 24px);
          height:560px;
          max-height:calc(100vh - 32px);
          border-radius:28px;
          background:var(--panel);
          box-shadow:0 40px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.08);
          overflow:hidden;
          display:flex;
          z-index:10;
          margin:auto;
        }
        .visual{
          position:relative;
          width:50%;
          height:100%;
          overflow:hidden;
          transition:transform .8s cubic-bezier(.65,0,.35,1);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:2;
          flex-shrink:0;
        }
        .visual::before{
          content:'';
          position:absolute;inset:-20%;
          background:
            radial-gradient(circle at 30% 30%, var(--cyan) 0%, transparent 45%),
            radial-gradient(circle at 70% 70%, var(--violet) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, var(--pink) 0%, transparent 40%);
          filter:blur(40px) saturate(1.4);
          animation:blob 10s ease-in-out infinite;
          opacity:.85;
        }
        @keyframes blob{
          0%,100%{transform:translate(0,0) rotate(0deg) scale(1);}
          33%{transform:translate(4%,-5%) rotate(8deg) scale(1.08);}
          66%{transform:translate(-3%,4%) rotate(-6deg) scale(0.96);}
        }
        .brand{position:relative;z-index:2;text-align:center;color:#fff;padding:0 24px;}
        .brand h1{font-size:30px;margin:0 0 10px;letter-spacing:.5px;text-shadow:0 0 30px rgba(55,240,255,.6);font-weight:800;color:#ffffff;}
        .brand p{color:rgba(255,255,255,.8);font-size:14px;line-height:1.6;max-width:280px;margin:0 auto;}

        .formside{
          position:relative;
          width:50%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          transition:transform .8s cubic-bezier(.65,0,.35,1);
          padding:28px 24px;
          overflow-y:auto;
          z-index:3;
          flex-shrink:0;
        }
        .formside form{width:100%;max-width:320px;margin:0 auto;}
        .toggle-title{color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;font-weight:700;}
        .formside h2{color:#ffffff;font-size:28px;margin:0 0 20px;font-weight:800;letter-spacing:-0.5px;}
        .field{position:relative;margin-bottom:16px;}
        .field input, .field select{
          width:100%;padding:13px 16px;
          background:#141724;border:1.5px solid #2e3452;
          border-radius:12px;
          color:#ffffff !important;
          -webkit-text-fill-color:#ffffff !important;
          caret-color:#37f0ff;
          font-size:15px;
          font-weight:600;
          outline:none;transition:.25s;
        }
        .field input::placeholder{
          color:#94a3b8;
          opacity:0.7;
        }
        .field input:-webkit-autofill,
        .field input:-webkit-autofill:hover, 
        .field input:-webkit-autofill:focus{
          -webkit-text-fill-color:#ffffff !important;
          -webkit-box-shadow:0 0 0px 1000px #141724 inset !important;
          box-shadow:0 0 0px 1000px #141724 inset !important;
          caret-color:#37f0ff !important;
          transition:background-color 5000s ease-in-out 0s;
        }
        .field input:focus{
          border-color:var(--cyan);
          background:#181c2d;
          box-shadow:0 0 0 3px rgba(55,240,255,.2), 0 0 20px rgba(55,240,255,.3);
        }
        .field label{
          position:absolute;left:16px;top:13px;
          color:#94a3b8;
          font-size:13.5px;
          font-weight:600;
          pointer-events:none;transition:.2s;background:transparent;
          text-shadow:0 1px 2px rgba(0,0,0,0.5);
        }
        .field input:focus + label, .field input:not(:placeholder-shown) + label{
          top:-9px;left:12px;font-size:11px;background:#0d0f18;padding:0 6px;color:#37f0ff !important;font-weight:700;border-radius:4px;
        }
        .btn{
          width:100%;padding:13px;border:none;border-radius:12px;
          background:linear-gradient(90deg,var(--cyan),var(--violet));
          color:#03040a;font-weight:800;font-size:15px;cursor:pointer;
          box-shadow:0 10px 30px rgba(139,92,255,.35);
          transition:transform .2s, box-shadow .2s;
        }
        .btn:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(139,92,255,.5);}
        .switch{margin-top:18px;text-align:center;color:var(--muted);font-size:13px;}
        .switch span{color:var(--cyan);cursor:pointer;font-weight:700;}
        .switch span:hover{text-decoration:underline;}

        /* signup mode: swap sides for desktop/tablet */
        @media (min-width: 641px) {
          .stage.signup .visual{transform:translateX(100%);}
          .stage.signup .formside{transform:translateX(-100%);}
        }
        .panel{display:none;}
        .panel.active{display:block;animation:fadein .4s ease;width:100%;}
        @keyframes fadein{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}

        /* Tablet Responsive (641px to 1024px) */
        @media (min-width: 641px) and (max-width: 1024px) {
          .stage {
            width: 92vw;
            max-width: 720px;
            height: 500px;
            max-height: calc(100vh - 32px);
            border-radius: 24px;
          }
          .brand {
            padding: 0 16px;
          }
          .brand .logo-icon {
            width: 44px !important;
            height: 44px !important;
            font-size: 17px !important;
            margin-bottom: 8px !important;
          }
          .brand h1 {
            font-size: 22px;
            margin-bottom: 6px;
          }
          .brand p {
            font-size: 12.5px;
            line-height: 1.45;
          }
          .formside {
            padding: 20px 18px;
          }
          .formside h2 {
            font-size: 22px;
            margin-bottom: 14px;
          }
          .toggle-title {
            font-size: 11px;
            margin-bottom: 2px;
          }
          .field {
            margin-bottom: 13px;
          }
          .field input {
            padding: 11px 14px;
            font-size: 14px;
          }
          .field label {
            top: 11px;
            font-size: 12.5px;
          }
          .btn {
            padding: 11px;
            font-size: 14px;
          }
          .switch {
            margin-top: 14px;
            font-size: 12px;
          }
        }

        /* Mobile Responsive (<= 640px) */
        @media (max-width: 640px) {
          .stage {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 420px !important;
            height: 550px !important;
            min-height: 550px !important;
            border-radius: 24px;
            box-shadow: 0 30px 80px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.08);
            margin: 12px auto;
            position: relative;
            overflow: hidden;
          }
          .visual {
            width: 100% !important;
            height: 140px !important;
            min-height: 140px !important;
            padding: 16px 16px 14px !important;
            transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1) !important;
            z-index: 2 !important;
          }
          .stage.signup .visual {
            transform: translateY(410px) !important;
          }
          .formside {
            width: 100% !important;
            height: 410px !important;
            padding: 20px 20px 24px !important;
            overflow-y: auto !important;
            transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1) !important;
            z-index: 3 !important;
          }
          .stage.signup .formside {
            transform: translateY(-140px) !important;
          }
          .brand {
            padding: 0 12px;
          }
          .brand .logo-icon {
            width: 42px !important;
            height: 42px !important;
            font-size: 16px !important;
            margin-bottom: 6px !important;
            border-radius: 14px !important;
          }
          .brand h1 {
            font-size: 20px !important;
            margin-bottom: 3px !important;
            font-weight: 800 !important;
          }
          .brand p {
            font-size: 12px !important;
            line-height: 1.4 !important;
            max-width: 280px !important;
          }
          .formside form {
            max-width: 100%;
          }
          .formside h2 {
            font-size: 24px !important;
            margin-bottom: 14px !important;
            font-weight: 800 !important;
          }
          .toggle-title {
            font-size: 11px !important;
            margin-bottom: 2px !important;
            letter-spacing: 2px !important;
          }
          .field {
            margin-bottom: 13px !important;
          }
          .field input {
            font-size: 16px !important; /* Prevents auto zoom on mobile */
            padding: 12px 14px !important;
            border-radius: 12px !important;
          }
          .field label {
            font-size: 13px !important;
            top: 12px !important;
            left: 14px !important;
          }
          .field input:focus + label, .field input:not(:placeholder-shown) + label {
            top: -8px !important;
            left: 10px !important;
            font-size: 10.5px !important;
            padding: 0 5px !important;
          }
          .btn {
            padding: 12px !important;
            border-radius: 12px !important;
            font-size: 15px !important;
            font-weight: 800 !important;
          }
          .switch {
            margin-top: 14px !important;
            font-size: 12.5px !important;
          }
        }
      ` }} />

      <div className={`stage ${formMode === 'signup' ? 'signup' : ''}`} id="stage">
        {/* Visual Side */}
        <div className="visual">
          <div className="brand">
            <div className="logo-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#37f0ff]/10 text-[#37f0ff] mb-4 border border-[#37f0ff]/30 shadow-lg shadow-[#37f0ff]/20 text-xl font-black">
              P
            </div>
            <h1>
              {formMode === 'signup' ? 'Join Pragatii' : 'Welcome to Pragatii'}
            </h1>
            <p>
              {formMode === 'signup' 
                ? 'Create your account and track your skill roadmaps today.' 
                : 'Sign in to pick up right where you left off.'}
            </p>
          </div>
        </div>

        {/* Form Side */}
        <div className="formside">
          {/* LOGIN PANEL */}
          <div className={`panel ${formMode === 'login' ? 'active' : ''}`} id="loginPanel">
            <div className="toggle-title">Pragatii Skill Hub</div>
            <h2>Log in</h2>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold text-center">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={14} className="shrink-0" /> <span>{authError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-extrabold transition-all cursor-pointer"
                >
                  <KeyRound size={12} /> Reset password for this email
                </button>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="field">
                <input 
                  type="email" 
                  placeholder=" " 
                  required 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
                <label>Email address</label>
              </div>
              
              <div className="field relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder=" " 
                  required 
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
                <label>Password</label>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button 
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn" disabled={authLoading}>
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="animate-spin" size={16} /> Connecting...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </form>

            <div className="switch">
              New here? <span onClick={() => switchMode('signup')}>Create an account</span>
            </div>
          </div>

          {/* SIGNUP PANEL */}
          <div className={`panel ${formMode === 'signup' ? 'active' : ''}`} id="signupPanel">
            <div className="toggle-title">Pragatii Skill Hub</div>
            <h2>Sign up</h2>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold text-center">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={14} className="shrink-0" /> <span>{authError}</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-extrabold transition-all cursor-pointer"
                  >
                    Go to Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-extrabold transition-all cursor-pointer"
                  >
                    <KeyRound size={12} /> Reset password
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="field">
                <input 
                  type="text" 
                  placeholder=" " 
                  required 
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                />
                <label>Full name</label>
              </div>

              <div className="field">
                <input 
                  type="email" 
                  placeholder=" " 
                  required 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
                <label>Email address</label>
              </div>

              <div className="field relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder=" " 
                  required 
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
                <label>Password</label>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="btn" disabled={authLoading}>
                {authLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCcw className="animate-spin" size={16} /> Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="switch">
              Already have an account? <span onClick={() => switchMode('login')}>Log in</span>
            </div>
          </div>

          {/* FORGOT PASSWORD PANEL */}
          <div className={`panel ${formMode === 'forgot' ? 'active' : ''}`} id="forgotPanel">
            <div className="toggle-title">Pragatii Skill Hub</div>
            <h2>Account Recovery</h2>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle size={14} /> <span>{authError}</span>
              </div>
            )}

            {isResetSent && resetMessage && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center">
                {resetMessage}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="field">
                <input 
                  type="email" 
                  placeholder=" " 
                  required 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
                <label>Email address</label>
              </div>

              <div className="flex flex-col gap-2.5 mt-2">
                <button type="submit" className="btn" disabled={authLoading || cooldown > 0}>
                  {authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCcw className="animate-spin" size={16} /> Sending...
                    </span>
                  ) : cooldown > 0 ? (
                    `⏳ Email Sent — Wait (${cooldown}s)`
                  ) : (
                    '🔑 Send Password Reset Link'
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={handleMagicLink}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={authLoading || cooldown > 0}
                >
                  {cooldown > 0 ? `✨ Check your inbox or wait (${cooldown}s)` : '✨ Send 1-Click Magic Login Link'}
                </button>
              </div>
            </form>

            <div className="switch">
              Remember your password? <span onClick={() => switchMode('login')}>Back to Log in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


