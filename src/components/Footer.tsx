import React, { useState } from 'react';
import { PageType, Profile } from '../types';
import { 
  Facebook, 
  Mail, 
  MessageSquare, 
  Compass, 
  Trophy, 
  LayoutDashboard, 
  ArrowRight, 
  ExternalLink,
  Shield,
  User,
  X,
  FileText,
  Lock,
  Cookie
} from 'lucide-react';
import { PragatiiLogo } from './PragatiiLogo';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  currentUser: Profile;
  onOpenSendFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser, onOpenSendFeedback }) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'cookies' | null>(null);

  return (
    <>
      <footer 
        className="footer-container relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F6F3EE] to-[#EFECE6] dark:from-[#0B0D17] dark:via-[#0E111F] dark:to-[#080910] text-[#555865] dark:text-slate-400 pt-16 pb-12 mt-20 border-t border-[#E8E4DC] dark:border-[#23273e] font-sans transition-colors duration-300" 
        id="app-main-footer"
      >
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-36 bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-36 bg-[#1B9C63]/10 dark:bg-[#1B9C63]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Accent Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6C5CE7]/50 dark:via-[#a29bfe]/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
          
          {/* Main 3-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#E8E4DC] dark:border-[#23273e]">
            
            {/* Col 1: Brand & Bio (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div 
                className="flex items-center gap-3.5 group cursor-pointer select-none"
                onClick={() => {
                  onNavigate('discover');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="p-2.5 rounded-2xl bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] shadow-2xs group-hover:scale-105 group-hover:shadow-md group-hover:border-[#6C5CE7]/40 dark:group-hover:border-[#6C5CE7]/40 transition-all duration-300">
                  <PragatiiLogo size={36} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-[#22252E] dark:text-white leading-none">
                      Pragatii
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#1B9C63] animate-pulse" title="System Live" />
                  </div>
                  <span className="text-[11px] font-bold text-[#6C5CE7] dark:text-purple-400 tracking-wider uppercase mt-1 block">
                    Skill Sprints &amp; Roadmaps
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#555865] dark:text-slate-400 leading-relaxed max-w-sm">
                Empowering students and engineering cohorts with gamified skill sprints, structured roadmaps, and peer competition.
              </p>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] text-[#22252E] dark:text-slate-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                  Gamified Sprints
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] text-[#22252E] dark:text-slate-300 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B9C63]" />
                  Campus Cohorts
                </span>
              </div>
            </div>

            {/* Col 2: Quick Links (4 cols) */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#22252E] dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C5CE7]" />
                Quick Links
              </h4>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <button 
                    onClick={() => { 
                      onNavigate('discover'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                    className="w-full group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-[#6C5CE7] dark:hover:text-purple-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#6C5CE7]/10 dark:bg-purple-950/60 text-[#6C5CE7] dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-xs sm:text-sm">Discover Roadmaps</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#6C5CE7]" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { 
                      onNavigate('dashboard'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                    className="w-full group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-[#1B9C63] dark:hover:text-emerald-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1B9C63]/10 dark:bg-emerald-950/60 text-[#1B9C63] dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-xs sm:text-sm">Active Challenge</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#1B9C63]" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { 
                      onNavigate('leaderboard'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                    className="w-full group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-xs sm:text-sm">Campus Leaderboard</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500" />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { 
                      onNavigate('profile'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }}
                    className="w-full group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-[#6C5CE7] dark:hover:text-purple-300 transition-all duration-200 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-xs sm:text-sm">My Profile &amp; Badges</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-500" />
                  </button>
                </li>
                {currentUser?.is_admin && (
                  <li>
                    <button 
                      onClick={() => { 
                        onNavigate('admin'); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }}
                      className="w-full group p-2 rounded-xl bg-[#6C5CE7]/10 dark:bg-purple-950/40 hover:bg-[#6C5CE7] dark:hover:bg-[#6C5CE7] border border-[#6C5CE7]/30 text-[#6C5CE7] dark:text-purple-300 hover:text-white dark:hover:text-white transition-all duration-200 flex items-center justify-between text-left cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#141726] text-[#6C5CE7] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm">Admin Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Col 3: Contact & Support (3 cols) */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#22252E] dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1B9C63]" />
                Contact Us
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a 
                    href="mailto:mdsohanali636@gmail.com" 
                    className="group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-[#22252E] dark:hover:text-white transition-all duration-200 flex items-center gap-2.5"
                    title="Send Email"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold leading-tight">Email</span>
                      <span className="text-[11px] text-[#8B8A86] dark:text-slate-400 truncate block">mdsohanali636@gmail.com</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://facebook.com/parodorshhi" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-[#1877F2] dark:hover:text-blue-400 transition-all duration-200 flex items-center gap-2.5"
                    title="Facebook Page"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Facebook className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold leading-tight">Facebook</span>
                      <span className="text-[11px] text-[#8B8A86] dark:text-slate-400 truncate block">/parodorshhi</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#8B8A86] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      if (onOpenSendFeedback) {
                        onOpenSendFeedback();
                      }
                    }}
                    className="w-full group p-2 rounded-xl hover:bg-white dark:hover:bg-[#141726] border border-transparent hover:border-[#E8E4DC] dark:hover:border-[#23273e] hover:shadow-2xs text-[#555865] dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 transition-all duration-200 flex items-center gap-2.5 text-left cursor-pointer"
                    id="footer-btn-send-feedback"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold leading-tight">Feedback</span>
                      <span className="text-[11px] text-[#8B8A86] dark:text-slate-400 block">Report issue / Suggestion</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Legal */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#555865] dark:text-slate-400">
            <div className="font-semibold tracking-wide flex items-center gap-2">
              <span>© {new Date().getFullYear()} PRAGATII. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 font-medium flex-wrap justify-center">
              <button 
                onClick={() => setActiveLegalModal('privacy')} 
                className="hover:text-[#6C5CE7] dark:hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3 text-[#6C5CE7]" />
                <span>Privacy Policy</span>
              </button>
              <button 
                onClick={() => setActiveLegalModal('terms')} 
                className="hover:text-[#6C5CE7] dark:hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-[#6C5CE7]" />
                <span>Terms of Service</span>
              </button>
              <button 
                onClick={() => setActiveLegalModal('cookies')} 
                className="hover:text-[#6C5CE7] dark:hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Cookie className="w-3 h-3 text-[#6C5CE7]" />
                <span>Cookie Policy</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Informational Legal Modal */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#141726] border border-[#E8E4DC] dark:border-[#23273e] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <button 
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#1e2238] text-[#8B8A86] hover:text-[#22252E] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {activeLegalModal === 'privacy' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#22252E] dark:text-white">Privacy Policy</h3>
                    <p className="text-xs text-[#8B8A86] dark:text-slate-400">Your privacy & data security</p>
                  </div>
                </div>
                <div className="text-xs text-[#555865] dark:text-slate-300 space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-2">
                  <p>At Pragatii, we respect your privacy. All your skill progress, milestones, and feedback are encrypted and securely stored.</p>
                  <p>We do not sell or share personal profile details with third-party advertisers. Learning analytics are strictly utilized to compute leaderboard rankings and sprint completions.</p>
                </div>
              </>
            )}

            {activeLegalModal === 'terms' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1B9C63]/10 text-[#1B9C63] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#22252E] dark:text-white">Terms of Service</h3>
                    <p className="text-xs text-[#8B8A86] dark:text-slate-400">Platform guidelines & code of conduct</p>
                  </div>
                </div>
                <div className="text-xs text-[#555865] dark:text-slate-300 space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-2">
                  <p>Welcome to Pragatii. By utilizing the platform, you agree to engage respectfully within your campus cohorts and respect sprint deadlines.</p>
                  <p>Roadmaps, curated references, and documentation are provided for educational skill development. Respect community feedback channels and peer interactions.</p>
                </div>
              </>
            )}

            {activeLegalModal === 'cookies' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Cookie className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#22252E] dark:text-white">Cookie Policy</h3>
                    <p className="text-xs text-[#8B8A86] dark:text-slate-400">Essential tokens & session persistence</p>
                  </div>
                </div>
                <div className="text-xs text-[#555865] dark:text-slate-300 space-y-2.5 leading-relaxed max-h-60 overflow-y-auto pr-2">
                  <p>Pragatii uses essential local storage and session tokens to preserve your login session, dark/light theme preference, and challenge timer continuity.</p>
                  <p>No non-essential third-party tracking cookies are placed on your device.</p>
                </div>
              </>
            )}

            <div className="pt-3 border-t border-[#E8E4DC] dark:border-[#23273e] flex justify-end">
              <button 
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5848c2] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
