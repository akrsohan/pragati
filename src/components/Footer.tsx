import React, { useState, useEffect } from 'react';
import { PageType, Profile } from '../types';
import { Facebook, Mail, MessageSquare, Compass, Trophy, LayoutDashboard, CheckCircle2, Loader2 } from 'lucide-react';
import { PragatiiLogo } from './PragatiiLogo';
import { subscribeToNewsletter, getNewsletterSubscribersCount } from '../lib/supabaseService';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  currentUser: Profile;
  onOpenSendFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser, onOpenSendFeedback }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number>(1);

  useEffect(() => {
    getNewsletterSubscribersCount().then(count => setSubscriberCount(count));
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await subscribeToNewsletter(newsletterEmail);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      setNewsletterEmail('');
      getNewsletterSubscribersCount().then(count => setSubscriberCount(count));
      setTimeout(() => setStatusMessage(null), 6000);
    } else {
      setStatusMessage({ type: 'error', text: res.message });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <footer className="bg-white dark:bg-[#12141c] text-slate-600 dark:text-[#9ca3af] pt-16 pb-12 border-t border-slate-200 dark:border-white/10 mt-20 font-sans transition-colors duration-200" id="app-main-footer">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14 pb-12 border-b border-slate-200 dark:border-white/10">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 flex items-center justify-center">
                <PragatiiLogo size={42} />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-wider">
                Pragatii
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-[#9ca3af] leading-relaxed">
              Empowering students and engineering cohorts with gamified skill sprints, structured roadmaps, and peer competition.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">Quick Links</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button 
                  onClick={() => { onNavigate('discover'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#6c5ce7] dark:hover:text-white transition-colors text-left flex items-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Discover Roadmaps</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-emerald-600 dark:hover:text-white transition-colors text-left flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  <span>Active Challenge</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('leaderboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-amber-600 dark:hover:text-white transition-colors text-left flex items-center gap-2 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Campus Leaderboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#6c5ce7] dark:hover:text-white transition-colors text-left cursor-pointer"
                >
                  My Profile &amp; Badges
                </button>
              </li>
              {currentUser.is_admin && (
                <li>
                  <button 
                    onClick={() => { onNavigate('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-purple-600 dark:hover:text-white transition-colors text-left text-[#6c5ce7] dark:text-purple-300 font-bold cursor-pointer"
                  >
                    Admin Dashboard
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Contact Us */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="mailto:mdsohanali636@gmail.com" 
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2.5 group"
                  title="Send Email to mdsohanali636@gmail.com"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-red-50 dark:group-hover:bg-red-500/20 text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-colors flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">mdsohanali636@gmail.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/parodorshhi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2.5 group"
                  title="Facebook: facebook.com/parodorshhi"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/20 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors flex items-center justify-center">
                    <Facebook className="w-3.5 h-3.5" />
                  </div>
                  <span>facebook.com/parodorshhi</span>
                </a>
              </li>
              <li className="pt-1">
                <button 
                  onClick={() => {
                    if (onOpenSendFeedback) {
                      onOpenSendFeedback();
                    } else {
                      alert('Please log in to submit your feedback.');
                    }
                  }}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2.5 text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                  id="footer-btn-send-feedback"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-[#6c5ce7]/20 text-slate-500 dark:text-slate-400 hover:text-[#6c5ce7] flex items-center justify-center transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">Send Feedback</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white mb-5">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-[#9ca3af] mb-4">
              Get the latest updates on new skill tracks and sprint deadlines.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3.5">
              <div className="relative">
                <input 
                  type="email" 
                  required
                  placeholder="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#1b1e2c] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6b7280] focus:outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#6c5ce7] hover:bg-[#5848c2] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Join Newsletter</span>
                )}
              </button>
              {statusMessage && (
                <div className={`text-xs font-semibold flex items-center gap-1.5 p-2 rounded-lg ${
                  statusMessage.type === 'success' 
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' 
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'
                }`}>
                  {statusMessage.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </form>
            <div className="text-xs text-slate-400 dark:text-[#6b7280] mt-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Join <span className="text-slate-900 dark:text-white font-bold">{subscriberCount}</span> active subscribers</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 dark:text-[#6b7280]">
          <div>
            © {new Date().getFullYear()} PRAGATII. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => alert('Privacy Policy: All student data is securely managed and protected.')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => alert('Terms of Service: Use platform resources for educational enrichment.')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => alert('Cookie Policy: We use essential cookies for user authentication state.')} className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              Cookie Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

