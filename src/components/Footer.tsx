import React, { useState } from 'react';
import { PageType, Profile } from '../types';
import { Facebook, Mail, MessageSquare, Compass, Trophy, LayoutDashboard } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  currentUser: Profile;
  onOpenSendFeedback?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser, onOpenSendFeedback }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#12141c] text-[#9ca3af] pt-16 pb-12 border-t border-white/10 mt-20 font-sans" id="app-main-footer">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6c5ce7] to-[#37f0ff] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#6c5ce7]/30">
                P
              </div>
              <span className="text-2xl font-black text-white tracking-wider">
                Pragatii
              </span>
            </div>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              Empowering students and engineering cohorts with gamified skill sprints, structured roadmaps, and peer competition.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">Quick Links</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button 
                  onClick={() => { onNavigate('discover'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Discover Roadmaps</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>Active Challenge</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('leaderboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Campus Leaderboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { onNavigate('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left"
                >
                  My Profile & Badges
                </button>
              </li>
              {currentUser.is_admin && (
                <li>
                  <button 
                    onClick={() => { onNavigate('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-white transition-colors text-left text-purple-300 font-bold"
                  >
                    Admin Dashboard
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Contact Us */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="mailto:mdsohanali636@gmail.com" 
                  className="hover:text-white transition-colors flex items-center gap-2.5 group"
                  title="Send Email to mdsohanali636@gmail.com"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
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
                  className="hover:text-white transition-colors flex items-center gap-2.5 group"
                  title="Facebook: facebook.com/parodorshhi"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-blue-500/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-colors">
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
                  className="hover:text-white transition-colors flex items-center gap-2.5 text-left text-slate-400 hover:text-slate-200 cursor-pointer"
                  id="footer-btn-send-feedback"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[#6c5ce7]/20 text-slate-400 hover:text-[#6c5ce7] flex items-center justify-center transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">Send Feedback</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-5">Newsletter</h4>
            <p className="text-sm text-[#9ca3af] mb-4">
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
                  className="w-full bg-[#1b1e2c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#6b7280] focus:outline-none focus:border-[#6c5ce7]"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-white hover:bg-slate-100 text-[#12141c] text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Join
              </button>
              {subscribed && (
                <div className="text-xs text-emerald-400 font-semibold">
                  ✓ Successfully subscribed!
                </div>
              )}
            </form>
            <div className="text-xs text-[#6b7280] mt-3">
              Join <span className="text-white font-bold">1</span> active subscribers
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6b7280]">
          <div>
            © {new Date().getFullYear()} PRAGATII. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => alert('Privacy Policy: All student data is securely managed and protected.')} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => alert('Terms of Service: Use platform resources for educational enrichment.')} className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => alert('Cookie Policy: We use essential cookies for user authentication state.')} className="hover:text-white transition-colors cursor-pointer">
              Cookie Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

