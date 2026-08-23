import React, { useState, useEffect, useMemo } from 'react';
import { 
  PageType, 
  Profile, 
  Skill, 
  Field, 
  RoadmapStep, 
  UserProgress, 
  Badge,
  SkillResource
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  ADMIN_EMAIL,
  initialFields, 
  initialSkills, 
  initialRoadmapSteps, 
  initialBadges, 
  initialProfiles,
  initialSkillResources
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { getMainName } from './lib/nameHelper';
import { DeadlineModal } from './components/DeadlineModal';
import { AddTimeModal } from './components/AddTimeModal';
import { CancelChallengeModal } from './components/CancelChallengeModal';
import { SkillModal, FieldModal, StepModal, ResourceModal, SqlCodeModal, DeleteConfirmModal } from './components/AdminModals';
import { PasswordRecoveryModal } from './components/PasswordRecoveryModal';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';
import { FeedbackModal } from './components/FeedbackModal';
import { UserFeedbackHistoryModal } from './components/UserFeedbackHistoryModal';
import { AdminFeedbackSection } from './components/AdminFeedbackSection';
import { SkillResourcesSection } from './components/SkillResourcesSection';
import { AdminRoadmapSection } from './components/AdminRoadmapSection';
import { HeroProgressCore3D } from './components/HeroProgressCore3D';
import { 
  getProfile,
  updateProfile,
  ensureProfile,
  getAllProfiles,
  getActiveProgress,
  startSkillChallenge,
  addExtraTimeToProgress,
  cancelProgress,
  completeChallenge,
  getUserCompletedProgress,
  getAllCompletedProgress,
  getUserBadges,
  getAdminStats,
  uploadAvatarImage,
  getAllFeedback,
  getStoredFields,
  saveStoredFields,
  getStoredSkills,
  saveStoredSkills,
  getStoredRoadmapSteps,
  saveStoredRoadmapSteps,
  getStoredSkillResources,
  saveStoredSkillResources,
  getAllSkillResources,
  addSkillResource,
  deleteSkillResource,
  fetchAllRoadmapSteps,
  addRoadmapStepToDb,
  deleteRoadmapStepFromDb,
  fetchAllFieldsDb,
  saveFieldToDb,
  deleteFieldFromDb,
  fetchAllSkillsDb,
  saveSkillToDb,
  deleteSkillFromDb,
  resetAllDataToDefaults
} from './lib/supabaseService';
import { 
  CheckCircle2, 
  CheckCircle,
  UserCheck,
  Clock, 
  Flame, 
  Trophy, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink, 
  Plus, 
  Shield, 
  Trash2, 
  ChevronRight, 
  BookOpen, 
  Upload, 
  Search,
  Filter,
  Zap,
  Sparkles,
  User,
  GraduationCap,
  Building2,
  Hash,
  MessageSquare,
  Phone,
  Camera,
  Save,
  Check,
  Share2,
  KeyRound,
  Eye,
  EyeOff,
  Link2,
  X,
  RotateCcw
} from 'lucide-react';

// Helper to format social contact links into working URLs
function formatSocialLink(type: 'facebook' | 'telegram' | 'whatsapp', input?: string): string {
  if (!input || !input.trim()) return '';
  const val = input.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;

  if (type === 'facebook') {
    if (val.startsWith('facebook.com/') || val.startsWith('fb.com/')) return `https://${val}`;
    const cleaned = val.startsWith('@') ? val.slice(1) : val;
    return `https://facebook.com/${cleaned}`;
  }

  if (type === 'telegram') {
    if (val.startsWith('t.me/')) return `https://${val}`;
    const cleaned = val.startsWith('@') ? val.slice(1) : val;
    return `https://t.me/${cleaned}`;
  }

  if (type === 'whatsapp') {
    if (val.startsWith('wa.me/')) return `https://${val}`;
    // If user provided an alphanumeric username / handle
    if (/[a-zA-Z]/.test(val)) {
      const cleaned = val.startsWith('@') ? val.slice(1) : val;
      return `https://wa.me/${cleaned}`;
    }
    // If user provided a numeric phone number
    let digits = val.replace(/[^0-9]/g, '');
    if (digits.startsWith('01')) {
      digits = '88' + digits;
    }
    return `https://wa.me/${digits}`;
  }

  return val;
}

export default function App() {
  // Navigation (Default to saved page or login)
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    try {
      const saved = localStorage.getItem('pragatii_active_page');
      if (saved && ['discover', 'dashboard', 'roadmap', 'leaderboard', 'profile', 'admin', 'feedback'].includes(saved)) {
        return saved as PageType;
      }
    } catch (e) {}
    return 'login';
  });

  // Keep track of active page in localStorage for seamless tab switching & refreshes
  useEffect(() => {
    try {
      if (currentPage && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'profile-setup') {
        localStorage.setItem('pragatii_active_page', currentPage);
      }
    } catch (e) {}
  }, [currentPage]);
  const [discoverView, setDiscoverView] = useState<'main' | 'fields' | 'field-skills' | 'all-skills'>('main');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Theme State (Dark Mode / Light Mode with localStorage persistence)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('skilltrack_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('skilltrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Auth Form State (Clean by default)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Data State (Persistent in local storage, synced with defaults)
  const [fields, setFields] = useState<Field[]>(() => getStoredFields());
  const [skills, setSkills] = useState<Skill[]>(() => getStoredSkills());
  const [roadmapSteps, setRoadmapSteps] = useState<Record<string, RoadmapStep[]>>(() => getStoredRoadmapSteps());
  const [skillResources, setSkillResources] = useState<Record<string, SkillResource[]>>(() => getStoredSkillResources());
  const [badges] = useState<Badge[]>(initialBadges);
  
  // Live Profiles & Progress State from Supabase
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [userBadgeIds, setUserBadgeIds] = useState<string[]>([]);
  const [allCompletedProgress, setAllCompletedProgress] = useState<UserProgress[]>([]);
  const [selectedUserCompletedProgress, setSelectedUserCompletedProgress] = useState<UserProgress[]>([]);
  
  // Selected Profile for Public Profile view
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Loading & Initialization state (Explicit loading state so app does not redirect while restoring session)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Logged-in User Profile (null when not authenticated)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Enforce Protected Route rules once session restoration is complete
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser || !currentUser.id) {
      if (currentPage !== 'login' && currentPage !== 'signup') {
        setCurrentPage('login');
      }
    } else if (!currentUser.profile_completed) {
      if (currentPage !== 'profile-setup') {
        setCurrentPage('profile-setup');
      }
    }
  }, [isAuthLoading, currentUser, currentPage]);

  // Active Challenge (User Progress)
  const [activeProgress, setActiveProgress] = useState<UserProgress | null>(null);

  // Admin Aggregate Stats
  const [adminStats, setAdminStats] = useState({
    totalUsers: 1,
    activeChallenges: 0,
    mostPopularSkillName: 'HTML',
    totalCompletions: 0
  });

  // Selected Skill for Roadmap view
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-html');

  // Modals
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isAddTimeModalOpen, setIsAddTimeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemTitle?: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Filter state for Discover
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Leaderboard Batch Filter
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('Batch 55');

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<'users' | 'fields' | 'skills' | 'steps' | 'feedback'>('users');
  const [adminUserSearch, setAdminUserSearch] = useState('');

  // Feedback Modals
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMyFeedbackModalOpen, setIsMyFeedbackModalOpen] = useState(false);

  // Profile Setup Form State
  const [setupFullName, setSetupFullName] = useState('');
  const [setupDepartment, setSetupDepartment] = useState('');
  const [setupRoll, setSetupRoll] = useState('');
  const [setupBatch, setSetupBatch] = useState('');
  const [setupFb, setSetupFb] = useState('');
  const [setupTelegram, setSetupTelegram] = useState('');
  const [setupWhatsapp, setSetupWhatsapp] = useState('');
  const [setupAvatarPreview, setSetupAvatarPreview] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Real-time Countdown Timer calculation
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean; percent: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    percent: 0
  });

  // Success Notification Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password Recovery / Reset New Password State
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false);
  const [newRecoveryPassword, setNewRecoveryPassword] = useState('');
  const [confirmRecoveryPassword, setConfirmRecoveryPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pastedLinkInput, setPastedLinkInput] = useState('');
  const [showRecoveryPass, setShowRecoveryPass] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  /**
   * Helper to activate session from a pasted Supabase email URL / hash
   */
  const handlePasteRecoveryLink = async (pastedText: string) => {
    try {
      let clean = pastedText.trim();
      if (clean.includes('#')) {
        clean = clean.split('#')[1];
      } else if (clean.includes('?')) {
        clean = clean.split('?')[1];
      }
      const params = new URLSearchParams(clean);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          showToast('Invalid or expired token link: ' + error.message);
        } else if (data?.session) {
          setIsPasswordRecoveryMode(true);
          showToast('✅ Session verified! Please enter your new password.');
        }
      } else {
        showToast('Could not find access_token in the pasted link.');
      }
    } catch (e: any) {
      showToast('Error verifying token link: ' + e.message);
    }
  };

  /**
   * Save the new password chosen during recovery
   */
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecoveryPassword || newRecoveryPassword.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }
    if (newRecoveryPassword !== confirmRecoveryPassword) {
      showToast('Passwords do not match. Please recheck.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newRecoveryPassword
      });
      if (error) {
        showToast('Failed to update password: ' + error.message);
      } else {
        showToast('✅ Password updated successfully! Welcome to your dashboard.');
        setIsPasswordRecoveryMode(false);
        setNewRecoveryPassword('');
        setConfirmRecoveryPassword('');
        if (data?.user) {
          await refreshAppData(data.user.id);
          setCurrentPage('discover');
        }
      }
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Master Data Loader: Fetches all live Supabase records
   */
  const refreshAppData = async (targetUid?: string) => {
    const uid = targetUid || currentUser?.id;

    try {
      // 1. Fetch all profiles
      const liveProfiles = await getAllProfiles();
      if (liveProfiles.length > 0) {
        setProfiles(liveProfiles);
      }

      // 2. Fetch all completed challenges across all users
      const liveCompleted = await getAllCompletedProgress();
      setAllCompletedProgress(liveCompleted);

      // 3. Fetch Admin stats
      const liveStats = await getAdminStats();
      setAdminStats(liveStats);

      // 4. Fetch live Roadmap steps, Skill Resources, Fields & Skills
      const liveSteps = await fetchAllRoadmapSteps();
      if (liveSteps) {
        setRoadmapSteps(liveSteps);
      }

      const liveResources = await getAllSkillResources();
      if (liveResources) {
        setSkillResources(liveResources);
      }

      const liveFields = await fetchAllFieldsDb();
      if (liveFields) {
        setFields(liveFields);
      }

      const liveSkills = await fetchAllSkillsDb();
      if (liveSkills) {
        setSkills(liveSkills);
      }

      // 5. Fetch specific user data if logged in
      if (uid) {
        const userProf = await getProfile(uid);
        if (userProf) {
          setCurrentUser(userProf);
        }

        const active = await getActiveProgress(uid);
        setActiveProgress(active);

        const badgesList = await getUserBadges(uid);
        setUserBadgeIds(badgesList);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  };

  // Sync Supabase Auth Session on mount and listen to changes
  useEffect(() => {
    let isMounted = true;

    // Auto-detect password recovery in URL hash or params
    if (window.location.hash.includes('type=recovery') || window.location.href.includes('type=recovery')) {
      setIsPasswordRecoveryMode(true);
    }

    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured()) {
          if (isMounted) {
            setIsAuthLoading(false);
            setCurrentPage('login');
          }
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Supabase Auth Init] getSession error:', error.message);
        }

        if (session?.user) {
          const uid = session.user.id;
          const uemail = session.user.email;

          let profile = await getProfile(uid);
          if (!profile) {
            profile = await ensureProfile({
              id: uid,
              email: uemail,
              full_name: session.user.user_metadata?.full_name
            });
          }

          if (uemail && (!profile.email || profile.email !== uemail)) {
            profile.email = uemail;
            const isAdmin = uemail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || Boolean(profile.is_admin);
            profile.is_admin = isAdmin;
            await updateProfile(uid, { email: uemail, is_admin: isAdmin });
          }

          if (isMounted) {
            setCurrentUser(profile);
            await refreshAppData(uid);
            if (!profile.profile_completed) {
              setCurrentPage('profile-setup');
            } else {
              setCurrentPage(prev => {
                if (prev === 'login' || prev === 'signup') {
                  try {
                    const saved = localStorage.getItem('pragatii_active_page');
                    if (saved && ['discover', 'dashboard', 'roadmap', 'leaderboard', 'profile', 'admin', 'feedback'].includes(saved)) {
                      return saved as PageType;
                    }
                  } catch (e) {}
                  return 'discover';
                }
                return prev;
              });
            }
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
            setCurrentPage('login');
            await refreshAppData();
          }
        }
      } catch (err) {
        console.error('[Supabase Auth Init] Exception:', err);
        if (isMounted) {
          setCurrentUser(null);
          setCurrentPage('login');
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
        showToast('🔑 Recovery verified! Please set your new password.');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const uid = session.user.id;
        const uemail = session.user.email;
        let profile = await getProfile(uid);
        if (!profile) {
          profile = await ensureProfile({
            id: uid,
            email: uemail,
            full_name: session.user.user_metadata?.full_name
          });
        }
        if (uemail && (!profile.email || profile.email !== uemail)) {
          profile.email = uemail;
          const isAdmin = uemail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() || Boolean(profile.is_admin);
          profile.is_admin = isAdmin;
          await updateProfile(uid, { email: uemail, is_admin: isAdmin });
        }
        if (isMounted) {
          setCurrentUser(profile);
          await refreshAppData(uid);
          if (!profile.profile_completed) {
            setCurrentPage('profile-setup');
          } else {
            setCurrentPage(prev => {
              // ONLY redirect if user is coming from login or signup screen
              // Never redirect active browsing sessions on tab switch or token refresh!
              if (prev === 'login' || prev === 'signup') {
                try {
                  const saved = localStorage.getItem('pragatii_active_page');
                  if (saved && ['discover', 'dashboard', 'roadmap', 'leaderboard', 'profile', 'admin', 'feedback'].includes(saved)) {
                    return saved as PageType;
                  }
                } catch (e) {}
                return 'discover';
              }
              return prev;
            });
          }
          setIsAuthLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setCurrentUser(null);
          setActiveProgress(null);
          setUserBadgeIds([]);
          setCurrentPage('login');
          try {
            localStorage.removeItem('pragatii_active_page');
          } catch (e) {}
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // When currentUser changes, sync the Profile Setup form state
  useEffect(() => {
    if (currentUser) {
      setSetupFullName(currentUser.full_name || '');
      setSetupDepartment(currentUser.department || '');
      setSetupRoll(currentUser.roll_number || '');
      setSetupBatch(currentUser.batch_number || '');
      setSetupFb(currentUser.fb_link || '');
      setSetupTelegram(currentUser.telegram_link || '');
      setSetupWhatsapp(currentUser.whatsapp_link || '');
      setSetupAvatarPreview(currentUser.avatar_url || null);
    }
  }, [currentUser]);

  // When selectedUserId changes or Public Profile page is opened, fetch target user's completed skills
  useEffect(() => {
    if (currentPage === 'profile' && selectedUserId) {
      getUserCompletedProgress(selectedUserId).then(completedRows => {
        setSelectedUserCompletedProgress(completedRows);
      });
    }
  }, [currentPage, selectedUserId]);

  // Live Timer Tick (Updates every second based on real dates)
  useEffect(() => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const calculateTime = () => {
      const start = new Date(activeProgress.started_at).getTime();
      const deadline = new Date(activeProgress.deadline_at).getTime();
      const now = Date.now();

      const totalDuration = deadline - start;
      const elapsed = now - start;
      const remainingMs = deadline - now;

      if (remainingMs <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          percent: 100
        });
      } else {
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
        const seconds = Math.floor((remainingMs / 1000) % 60);
        const percent = totalDuration > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))) : 0;

        setTimeRemaining({
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
          percent
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeProgress]);

  // Live Batch Rank calculation for current user
  const userBatchRank = useMemo(() => {
    if (!currentUser || !currentUser.id) return '—';
    const batchList = profiles
      .filter(p => !currentUser.batch_number || p.batch_number === currentUser.batch_number)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    const idx = batchList.findIndex(p => p.id === currentUser.id);
    if (idx === -1) return '—';
    return `#${idx + 1}`;
  }, [profiles, currentUser]);

  // Derived current skill and steps
  const currentSkill = useMemo(() => {
    return skills.find(s => s.id === selectedSkillId) || skills[0] || { 
      id: '', 
      name: 'No Skill Available', 
      description: 'Please add skills from the admin panel.', 
      icon: '⚡', 
      bg_color: '#6c5ce7', 
      difficulty: 'Beginner', 
      field_id: '' 
    };
  }, [skills, selectedSkillId]);

  const currentSkillSteps = useMemo(() => {
    if (!currentSkill || !currentSkill.id) return [];
    return roadmapSteps[currentSkill.id] || [];
  }, [roadmapSteps, currentSkill]);

  // Target profile for Public Profile view
  const targetProfile = useMemo(() => {
    return profiles.find(p => p.id === selectedUserId) || currentUser;
  }, [profiles, selectedUserId, currentUser]);

  const targetBatchRank = useMemo(() => {
    if (!targetProfile || !targetProfile.id) return '—';
    const batchList = profiles
      .filter(p => !targetProfile.batch_number || p.batch_number === targetProfile.batch_number)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
    const idx = batchList.findIndex(p => p.id === targetProfile.id);
    if (idx === -1) return '—';
    return `#${idx + 1}`;
  }, [profiles, targetProfile]);

  // Leaderboard Qualified Profiles (must have completed at least one challenge, or points > 0)
  const filteredLeaderboardProfiles = useMemo(() => {
    const completedUserIds = new Set(allCompletedProgress.map(cp => cp.user_id));
    let list = profiles.filter(p => completedUserIds.has(p.id) || p.points > 0);

    if (selectedBatchFilter !== 'All departments') {
      list = list.filter(p => p.batch_number === selectedBatchFilter);
    }

    return list.sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [profiles, allCompletedProgress, selectedBatchFilter]);

  const top1 = filteredLeaderboardProfiles[0];
  const top2 = filteredLeaderboardProfiles[1];
  const top3 = filteredLeaderboardProfiles[2];

  // Admin Portal filtered and sorted users (Newest user first, oldest last)
  const filteredAdminProfiles = useMemo(() => {
    // Ensure sorted: newest created_at / registered first, oldest last
    let list = [...profiles].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeA && timeB) {
        return timeB - timeA; // Newest first
      }
      if (timeB && !timeA) return 1;
      if (timeA && !timeB) return -1;
      return 0;
    });

    const q = adminUserSearch.trim().toLowerCase();
    if (!q) return list;

    return list.filter(p => {
      const name = (p.full_name || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      const roll = (p.roll_number || '').toLowerCase();
      const dept = (p.department || '').toLowerCase();
      const batch = (p.batch_number || '').toLowerCase();
      return name.includes(q) || email.includes(q) || roll.includes(q) || dept.includes(q) || batch.includes(q);
    });
  }, [profiles, adminUserSearch]);

  // ==========================================
  // HANDLERS
  // ==========================================

  // Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] Initiating signUp for email:', authEmail.trim());

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authName.trim()
            }
          }
        });

        if (error) {
          console.error('[Supabase Auth] signUp request failed:', {
            message: error.message,
            status: error.status,
            name: error.name,
            error
          });
          if (error.message.toLowerCase().includes('already registered')) {
            setAuthError('An account with this email already exists. Please switch to Log in.');
          } else {
            setAuthError(error.message);
          }
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] signUp successful:', data);

        if (data.user) {
          const isUserAdmin = authEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
          const newProfile: Profile = {
            id: data.user.id,
            email: authEmail.trim().toLowerCase(),
            full_name: authName.trim(),
            department: '',
            roll_number: '',
            batch_number: '',
            profile_completed: false,
            points: 0,
            current_streak: 0,
            longest_streak: 0,
            is_admin: isUserAdmin,
            is_banned: false
          };

          await updateProfile(data.user.id, newProfile);
          setCurrentUser(newProfile);
          setProfiles(prev => [newProfile, ...prev.filter(p => p.id !== newProfile.id)]);

          // Initialize Profile Setup form with empty/blank fields
          setSetupFullName(authName.trim());
          setSetupDepartment('');
          setSetupRoll('');
          setSetupBatch('');
          setSetupFb('');
          setSetupTelegram('');
          setSetupWhatsapp('');
          setSetupAvatarPreview(null);

          showToast('Account created successfully! Please complete your profile.');
          setCurrentPage('profile-setup');
          await refreshAppData(data.user.id);
        }
      } else {
        // Login Mode
        console.log('[Supabase Auth] Initiating signIn for email:', authEmail.trim());

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });

        if (error) {
          console.error('[Supabase Auth] signIn failed:', {
            message: error.message,
            status: error.status,
            name: error.name,
            error
          });
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setAuthError('Invalid email or password. If you have not created an account yet, please click "Create an account" to Sign up first.');
          } else {
            setAuthError(error.message);
          }
          setAuthLoading(false);
          return;
        }

        console.log('[Supabase Auth] signIn successful:', data);

        if (data.user) {
          let userProf = await getProfile(data.user.id);
          const loginEmail = data.user.email || authEmail.trim();
          if (!userProf) {
            userProf = await ensureProfile({
              id: data.user.id,
              email: loginEmail,
              full_name: data.user.user_metadata?.full_name
            });
          }
          if (loginEmail && (!userProf.email || userProf.email !== loginEmail)) {
            userProf.email = loginEmail;
            const isAdmin = loginEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
            userProf.is_admin = isAdmin;
            await updateProfile(data.user.id, { email: loginEmail, is_admin: isAdmin });
          }

          setCurrentUser(userProf);
          await refreshAppData(data.user.id);
          showToast(`Welcome back, ${userProf.full_name || 'Student'}!`);

          if (!userProf.profile_completed) {
            setCurrentPage('profile-setup');
          } else {
            setCurrentPage('discover');
          }
        }
      }
    } catch (err: any) {
      console.error('[Supabase Auth] Unexpected exception during auth submit:', err);
      setAuthError(err.message || 'An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser({
        id: '',
        email: '',
        full_name: 'Guest User',
        department: '',
        roll_number: '',
        batch_number: '',
        profile_completed: false,
        points: 0,
        current_streak: 0,
        longest_streak: 0,
        is_admin: false,
        is_banned: false
      });
      setActiveProgress(null);
      setUserBadgeIds([]);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setCurrentPage('login');
      showToast('You have been signed out.');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Profile Setup Submission
  const handleSaveProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const hasAtLeastOneSocial = Boolean(setupFb.trim() || setupTelegram.trim() || setupWhatsapp.trim());
    const isMandatoryComplete = 
      Boolean(setupFullName.trim()) && 
      Boolean(setupDepartment.trim()) && 
      Boolean(setupBatch.trim()) && 
      Boolean(setupRoll.trim()) && 
      hasAtLeastOneSocial;

    if (!isMandatoryComplete) {
      setSetupError('সব ইনফো দেওয়া হয়নি। (All required mandatory information has not been provided)');
      setSetupLoading(false);
      return;
    }

    setSetupLoading(true);

    if (!currentUser || !currentUser.id) {
      setSetupError('Session expired. Please log in again.');
      setSetupLoading(false);
      setCurrentPage('login');
      return;
    }

    let finalAvatarUrl = currentUser.avatar_url;
    if (setupAvatarPreview && setupAvatarPreview.startsWith('data:')) {
      finalAvatarUrl = await uploadAvatarImage(currentUser.id, setupAvatarPreview);
    } else if (setupAvatarPreview) {
      finalAvatarUrl = setupAvatarPreview;
    }

    const payload: Partial<Profile> = {
      email: currentUser.email || undefined,
      full_name: setupFullName.trim() || currentUser.full_name,
      department: setupDepartment.trim() || currentUser.department,
      roll_number: setupRoll.trim() || currentUser.roll_number,
      batch_number: setupBatch.trim() || currentUser.batch_number,
      avatar_url: finalAvatarUrl,
      fb_link: setupFb.trim() || undefined,
      telegram_link: setupTelegram.trim() || undefined,
      whatsapp_link: setupWhatsapp.trim() || undefined,
      profile_completed: true
    };

    const { success, error } = await updateProfile(currentUser.id, payload);
    if (!success) {
      setSetupError(error || 'Failed to save profile to database.');
      setSetupLoading(false);
      return;
    }

    // Verify by re-fetching the updated profile from Supabase
    const freshProfile = await getProfile(currentUser.id);
    const verifiedProfile: Profile = freshProfile || {
      ...currentUser,
      ...payload,
      profile_completed: true
    };

    setCurrentUser(verifiedProfile);
    setProfiles(prev => {
      const idx = prev.findIndex(p => p.id === currentUser.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = verifiedProfile;
        return copy;
      }
      return [verifiedProfile, ...prev];
    });

    setSetupLoading(false);
    showToast('Profile setup completed successfully!');
    setCurrentPage('discover');
    await refreshAppData(currentUser.id);
  };

  // Avatar Upload Handler with Automatic Optimization
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize & compress to ~256x256 max for instant Supabase syncing
          const canvas = document.createElement('canvas');
          const maxDim = 280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setSetupAvatarPreview(optimizedBase64);
          } else {
            setSetupAvatarPreview(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Skill Challenge
  const handleStartSkill = async (days: number, hours: number) => {
    if (!currentUser.profile_completed) {
      showToast('Please complete your profile setup before starting a skill challenge!');
      setIsDeadlineModalOpen(false);
      setCurrentPage('profile-setup');
      return;
    }

    if (activeProgress && activeProgress.status === 'in_progress') {
      showToast('You already have an active challenge. Complete or cancel it before starting another.');
      setIsDeadlineModalOpen(false);
      setCurrentPage('dashboard');
      return;
    }

    const targetSkill = skills.find(s => s.id === selectedSkillId) || skills[0];
    const totalHours = Math.max(1, days * 24 + hours);

    const progress = await startSkillChallenge(currentUser.id, targetSkill.id, totalHours);
    if (progress) {
      setActiveProgress(progress);
      setIsDeadlineModalOpen(false);
      showToast(`Started ${targetSkill.name} challenge! Deadline: ${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h` : ''}`);
      setCurrentPage('dashboard');
    } else {
      showToast('Could not start challenge. Please try again.');
    }
  };

  // Cancel Active Challenge
  const handleCancelChallenge = async () => {
    if (!activeProgress) return;
    const progressId = activeProgress.id;
    const targetSkill = skills.find(s => s.id === activeProgress.skill_id);
    const skillName = targetSkill?.name || 'Skill';

    setActiveProgress(null);
    setIsCancelModalOpen(false);
    showToast(`Challenge for ${skillName} has been cancelled.`);

    await cancelProgress(progressId);
    await refreshAppData(currentUser.id);
  };

  // Complete Active Challenge
  const handleCompleteActiveChallenge = async () => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const skill = skills.find(s => s.id === activeProgress.skill_id) || skills[0];
    const progressId = activeProgress.id;

    const { success, newPoints, newStreak } = await completeChallenge(
      progressId,
      currentUser.id,
      currentUser.points,
      currentUser.current_streak,
      activeProgress.skill_id
    );

    setActiveProgress(null);

    const updatedUser = {
      ...currentUser,
      points: newPoints,
      current_streak: newStreak
    };
    setCurrentUser(updatedUser);
    setProfiles(prev => prev.map(p => p.id === currentUser.id ? updatedUser : p));

    showToast(`🎉 Congratulations! You completed ${skill.name} and earned +10 points!`);
    await refreshAppData(currentUser.id);
  };

  // Add Extra Time to Active Challenge
  const handleAddExtraTime = async (extraDays: number, extraHours: number) => {
    if (!activeProgress || activeProgress.status !== 'in_progress') return;

    const currentDeadline = new Date(activeProgress.deadline_at);
    const extraMs = (extraDays * 24 + extraHours) * 60 * 60 * 1000;
    const newDeadline = new Date(currentDeadline.getTime() + extraMs);
    const newDeadlineIso = newDeadline.toISOString();

    const updatedProgress: UserProgress = {
      ...activeProgress,
      deadline_at: newDeadlineIso
    };

    setActiveProgress(updatedProgress);
    showToast(`Added ${extraDays > 0 ? `${extraDays}d ` : ''}${extraHours > 0 ? `${extraHours}h` : ''} to your active challenge!`);

    await addExtraTimeToProgress(activeProgress.id, newDeadlineIso);
  };

  // Toggle Step Checkmark in Active Challenge
  const handleToggleStep = async (stepOrder: number) => {
    if (!activeProgress) return;
    const currentSteps = activeProgress.steps_completed || [];
    const newSteps = currentSteps.includes(stepOrder)
      ? currentSteps.filter(s => s !== stepOrder)
      : [...currentSteps, stepOrder];

    const updated = {
      ...activeProgress,
      steps_completed: newSteps
    };
    setActiveProgress(updated);

    try {
      await supabase
        .from('user_progress')
        .update({ steps_completed: newSteps })
        .eq('id', activeProgress.id);
    } catch (e) {
      console.error(e);
    }
  };

  // Open Public Profile
  const handleOpenUserProfile = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentPage('profile');
  };

  // Admin Ban Toggle
  const handleBanToggle = async (userId: string) => {
    const userToToggle = profiles.find(p => p.id === userId);
    if (!userToToggle) return;

    // Prevent banning self or any admin
    if (
      userToToggle.id === currentUser?.id ||
      userToToggle.is_admin ||
      (userToToggle.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()
    ) {
      showToast('Admin accounts cannot be banned.');
      return;
    }

    const newStatus = !userToToggle.is_banned;
    await updateProfile(userId, { is_banned: newStatus });
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_banned: newStatus } : p));
    showToast(`${userToToggle.full_name} is now ${newStatus ? 'Banned' : 'Active'}`);
  };

  // Admin Add/Edit Skill
  const handleSaveSkill = async (skillData: Partial<Skill>) => {
    let targetSkill: Skill;
    if (editingSkill) {
      targetSkill = { ...editingSkill, ...skillData } as Skill;
    } else {
      targetSkill = {
        id: `skill-${Date.now()}`,
        field_id: skillData.field_id || (fields[0]?.id || 'field-1'),
        name: skillData.name || 'New Skill',
        description: skillData.description || '',
        order_index: skills.length + 1,
        icon: skillData.icon || '★',
        bg_color: skillData.bg_color || '#6c5ce7',
        difficulty: skillData.difficulty || 'Beginner',
        avg_days: skillData.avg_days || '3 days',
        learner_count: 0,
        step_count: 3
      };
    }

    const result = await saveSkillToDb(targetSkill);
    if (!result.success) {
      showToast(`Failed to save skill: ${result.error || 'Database error'}`);
      return;
    }

    const updatedSkills = editingSkill
      ? skills.map(s => s.id === editingSkill.id ? targetSkill : s)
      : [...skills, targetSkill];

    setSkills(updatedSkills);
    showToast(editingSkill ? `Updated skill: ${targetSkill.name}` : `Added new skill: ${targetSkill.name}`);
    setIsSkillModalOpen(false);
    setEditingSkill(null);
  };

  const handleDeleteSkill = (skillId: string) => {
    const skillToDelete = skills.find(s => s.id === skillId);
    if (!skillToDelete) return;
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Skill Track',
      itemTitle: skillToDelete.name,
      message: `Are you sure you want to permanently delete "${skillToDelete.name}" from Supabase database and UI?`,
      confirmLabel: 'Delete Skill',
      onConfirm: async () => {
        const result = await deleteSkillFromDb(skillId);
        if (!result.success) {
          showToast(`Failed to delete skill: ${result.error || 'Database error'}`);
          return;
        }

        const updatedSkills = skills.filter(s => s.id !== skillId);
        setSkills(updatedSkills);

        // Clean up roadmap steps for this skill
        const updatedSteps = { ...roadmapSteps };
        delete updatedSteps[skillId];
        setRoadmapSteps(updatedSteps);
        saveStoredRoadmapSteps(updatedSteps);

        showToast(`Skill "${skillToDelete.name}" deleted successfully.`);
      }
    });
  };

  const handleSaveField = async (fieldData: Partial<Field>) => {
    let targetField: Field;
    if (editingField) {
      targetField = { ...editingField, ...fieldData } as Field;
    } else {
      targetField = {
        id: fieldData.id || `field-${Date.now()}`,
        name: fieldData.name || 'New Field',
        description: fieldData.description || '',
        icon: fieldData.icon || '💻',
        color: fieldData.color || '#00b894'
      };
    }

    const result = await saveFieldToDb(targetField);
    if (!result.success) {
      showToast(`Failed to save field category: ${result.error || 'Database error'}`);
      return;
    }

    const updatedFields = editingField
      ? fields.map(f => f.id === editingField.id ? targetField : f)
      : [...fields, targetField];

    setFields(updatedFields);
    showToast(editingField ? `Updated field: ${targetField.name}` : `Added new field: ${targetField.name}`);
    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    const fieldToDelete = fields.find(f => f.id === fieldId);
    if (!fieldToDelete) return;

    const hasDependentSkills = skills.some(s => s.field_id === fieldId);
    if (hasDependentSkills) {
      showToast('This field contains skills. Move or delete those skills first.');
      return;
    }

    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Field Category',
      itemTitle: fieldToDelete.name,
      message: `Are you sure you want to permanently delete category "${fieldToDelete.name}" from Supabase database?`,
      confirmLabel: 'Delete Category',
      onConfirm: async () => {
        const result = await deleteFieldFromDb(fieldId);
        if (!result.success) {
          showToast(result.error || 'Failed to delete field category from Supabase database.');
          return;
        }

        const updatedFields = fields.filter(f => f.id !== fieldId);
        setFields(updatedFields);
        showToast(`Field category "${fieldToDelete.name}" deleted successfully.`);
      }
    });
  };

  // Admin Add Step
  const handleAddStep = async (stepData: Partial<RoadmapStep>) => {
    const newStep: RoadmapStep = {
      id: `step-${Date.now()}`,
      skill_id: currentSkill.id,
      title: stepData.title || 'New Step',
      description: stepData.description || '',
      step_order: currentSkillSteps.length + 1,
      resource_link: stepData.resource_link
    };

    const saved = await addRoadmapStepToDb(newStep);
    const updatedSteps = {
      ...roadmapSteps,
      [currentSkill.id]: [...(roadmapSteps[currentSkill.id] || []), saved]
    };
    setRoadmapSteps(updatedSteps);
    saveStoredRoadmapSteps(updatedSteps);

    setIsStepModalOpen(false);
    showToast(`Added step "${saved.title}" to ${currentSkill.name}`);
  };

  const handleDeleteStep = (skillId: string, stepId: string) => {
    const stepToDelete = (roadmapSteps[skillId] || []).find(st => st.id === stepId);
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Roadmap Step',
      itemTitle: stepToDelete?.title || 'Roadmap Step',
      message: `Are you sure you want to delete step "${stepToDelete?.title || ''}"?`,
      confirmLabel: 'Delete Step',
      onConfirm: async () => {
        await deleteRoadmapStepFromDb(stepId, skillId);
        const updatedSteps = {
          ...roadmapSteps,
          [skillId]: (roadmapSteps[skillId] || []).filter(st => st.id !== stepId)
        };
        setRoadmapSteps(updatedSteps);
        saveStoredRoadmapSteps(updatedSteps);
        showToast(`Roadmap step deleted`);
      }
    });
  };

  // Admin Add Document / Reference Resource
  const handleAddResource = async (resData: Omit<SkillResource, 'id'>) => {
    try {
      const created = await addSkillResource(resData);
      const updated = {
        ...skillResources,
        [resData.skill_id]: [...(skillResources[resData.skill_id] || []), created]
      };
      setSkillResources(updated);
      saveStoredSkillResources(updated);
      setIsResourceModalOpen(false);
      showToast(`Added "${created.title}" successfully!`);
    } catch (err: any) {
      showToast(`Error adding resource: ${err?.message || 'Unknown'}`);
    }
  };

  // Admin Delete Document / Reference Resource
  const handleDeleteResource = (resourceId: string, skillId: string) => {
    const resToDelete = (skillResources[skillId] || []).find(r => r.id === resourceId);
    setDeleteConfirmState({
      isOpen: true,
      title: 'Delete Learning Resource',
      itemTitle: resToDelete?.title || 'Resource Material',
      message: `Are you sure you want to delete "${resToDelete?.title || ''}"? Learners will no longer see this material.`,
      confirmLabel: 'Delete Resource',
      onConfirm: async () => {
        await deleteSkillResource(resourceId, skillId);
        const updated = {
          ...skillResources,
          [skillId]: (skillResources[skillId] || []).filter(r => r.id !== resourceId)
        };
        setSkillResources(updated);
        saveStoredSkillResources(updated);
        showToast('Resource deleted successfully.');
      }
    });
  };

  const handleResetToDefaults = () => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'Reset to Defaults',
      itemTitle: 'All categories, skills, and roadmaps',
      message: 'Are you sure you want to restore all categories, skills, and roadmap steps to default seed data? All custom additions and deletions will be reset to default.',
      confirmLabel: 'Reset All',
      onConfirm: () => {
        resetAllDataToDefaults();
        setFields(initialFields);
        setSkills(initialSkills);
        setRoadmapSteps(initialRoadmapSteps);
        setSkillResources(initialSkillResources);
        showToast('All fields, skills, and roadmaps have been reset to defaults.');
      }
    });
  };

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#1a1c2e] font-sans antialiased">
      
      {currentUser && currentUser.is_banned && !currentUser.is_admin && (
        <div className="fixed inset-0 z-[100] bg-[#111322] flex items-center justify-center p-6 text-white font-sans antialiased">
          <div className="bg-[#1a1c2e] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-4 ring-red-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black mb-2 text-white">Account Suspended</h1>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your account (<span className="text-[#37f0ff] font-semibold">{currentUser.full_name}</span>) has been banned and suspended by the system administrator. You cannot access Pragatii resources, roadmaps, or leaderboards until your account is unbanned.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-xs text-slate-400 space-y-1">
              <div>Contact DIU Admin / Support:</div>
              <div className="text-white font-bold">{ADMIN_EMAIL}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-8 right-4 sm:right-6 z-50 bg-[#1a1c2e] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/15 animate-fade-in text-sm font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00b894] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Bar */}
      {currentUser && currentUser.id && (
        <Navbar 
          currentPage={currentPage}
          setCurrentPage={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          onNavigate={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          currentUser={currentUser}
          onSignOut={handleSignOut}
          onSelectUserForProfile={(userId) => {
            setSelectedUserId(userId);
            setCurrentPage('profile');
          }}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenMyFeedback={() => setIsMyFeedbackModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 1 — LOGIN / SIGNUP */}
      {/* ========================================================================= */}
      {(currentPage === 'login' || currentPage === 'signup') && (
        <LandingPage 
          authMode={authMode}
          setAuthMode={setAuthMode}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authName={authName}
          setAuthName={setAuthName}
          authLoading={authLoading}
          authError={authError}
          setAuthError={setAuthError}
          handleAuthSubmit={handleAuthSubmit}
          onForgotPassword={async (email) => {
            console.log('[Supabase Auth] Requesting resetPasswordForEmail for:', email);
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin
            });
            if (error) {
              console.error('[Supabase Auth] resetPasswordForEmail failed:', error);
              if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate_limit') || (error as any).status === 429) {
                const friendlyMsg = 'A reset email was already sent recently. Please check your inbox (including spam) or wait 60 seconds.';
                setAuthError(friendlyMsg);
                throw new Error(friendlyMsg);
              }
              setAuthError(error.message);
              throw error;
            }
            console.log('[Supabase Auth] resetPasswordForEmail success for:', email);
            setAuthError(null);
            showToast('Password reset email sent! Check your inbox.');
          }}
          onSendMagicLink={async (email) => {
            console.log('[Supabase Auth] Requesting signInWithOtp for:', email);
            const { error } = await supabase.auth.signInWithOtp({
              email,
              options: {
                emailRedirectTo: window.location.origin
              }
            });
            if (error) {
              console.error('[Supabase Auth] signInWithOtp failed:', error);
              if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('rate_limit') || (error as any).status === 429) {
                const friendlyMsg = 'A login email was already sent recently. Please check your inbox (including spam) or wait 60 seconds.';
                setAuthError(friendlyMsg);
                throw new Error(friendlyMsg);
              }
              setAuthError(error.message);
              throw error;
            }
            console.log('[Supabase Auth] signInWithOtp success for:', email);
            setAuthError(null);
            showToast('Magic login link sent to your email!');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* PAGE 2 — PROFILE SETUP & SETTINGS */}
      {/* ========================================================================= */}
      {currentPage === 'profile-setup' && (() => {
        const step1Done = Boolean(setupFullName.trim());
        const step2Done = Boolean(setupDepartment.trim() && setupBatch.trim() && setupRoll.trim());
        const step3Done = Boolean(setupFb.trim() || setupTelegram.trim() || setupWhatsapp.trim());
        
        let activeStepNum = 1;
        if (step1Done && !step2Done) activeStepNum = 2;
        else if (step1Done && step2Done && !step3Done) activeStepNum = 3;
        else if (step1Done && step2Done && step3Done) activeStepNum = 3;

        const progressPercent = (step1Done ? 33.3 : 0) + (step2Done ? 33.3 : 0) + (step3Done ? 33.4 : 0);

        return (
        <div className="page" id="page-profile-setup">
          <div className="page-tag">PAGE 2 — STUDENT PROFILE SETTINGS</div>

          <div className="profile-edit-wrapper w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
            
            {/* Header / Breadcrumb Bar with 3D Identity Visual */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                {currentUser.profile_completed && (
                  <button 
                    onClick={() => setCurrentPage('profile')}
                    className="text-xs font-bold text-[#6c5ce7] hover:underline flex items-center gap-1.5 mb-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to My Profile
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#8477f3] text-white flex items-center justify-center shadow-md shadow-[#6c5ce7]/30 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1a1c2e] tracking-tight">
                      {currentUser.profile_completed ? 'Edit Profile & Settings' : 'Complete Your Profile'}
                    </h1>
                    <p className="text-xs text-[#8a8ca3] mt-0.5">
                      Keep your academic credentials and peer contact channels accurate for leaderboard rankings.
                    </p>
                  </div>
                </div>
              </div>

              {currentUser.email && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-semibold text-[#64748b] shadow-xs self-start sm:self-auto">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* 2.5D Step / Journey Indicator Bar */}
            <div className="setup-journey-card-3d mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-[#e4e5ee] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6c5ce7] bg-[#f1eefe] px-2.5 py-0.5 rounded-md border border-[#6c5ce7]/20">
                    Step {activeStepNum} of 3
                  </span>
                  <span className="text-xs font-bold text-[#1a1c2e] hidden xs:inline">
                    {activeStepNum === 1 ? 'Personal Info & Avatar' : activeStepNum === 2 ? 'Academic Credentials' : 'Peer Social Channels'}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#64748b]">
                  <span className="font-mono text-[#6c5ce7]">{Math.round(progressPercent)}%</span> Completed
                </div>
              </div>

              {/* Progress Connection Line */}
              <div className="relative w-full h-2 rounded-full bg-[#e2e8f0] overflow-hidden mb-5">
                <div 
                  className="h-full bg-gradient-to-r from-[#6c5ce7] via-[#8477f3] to-[#00b894] rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* 3D Step Pills Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {/* Step 1 */}
                <div className={`step-badge-3d ${step1Done ? 'step-done' : activeStepNum === 1 ? 'step-active' : 'step-upcoming'}`}>
                  <div className="step-circle-3d">
                    {step1Done ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span>1</span>}
                  </div>
                  <div className="step-label-group">
                    <span className="step-num-text">Step 1</span>
                    <span className="step-title-text">Personal Info</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`step-badge-3d ${step2Done ? 'step-done' : activeStepNum === 2 ? 'step-active' : 'step-upcoming'}`}>
                  <div className="step-circle-3d">
                    {step2Done ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span>2</span>}
                  </div>
                  <div className="step-label-group">
                    <span className="step-num-text">Step 2</span>
                    <span className="step-title-text">Academic ID</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`step-badge-3d ${step3Done ? 'step-done' : activeStepNum === 3 ? 'step-active' : 'step-upcoming'}`}>
                  <div className="step-circle-3d">
                    {step3Done ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <span>3</span>}
                  </div>
                  <div className="step-label-group">
                    <span className="step-num-text">Step 3</span>
                    <span className="step-title-text">Peer Contacts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {setupError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50/95 border-1.5 border-red-300 text-red-700 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-md shadow-red-500/10">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 animate-bounce" />
                <span>{setupError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSetup}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Identity Preview & Avatar (4 cols) */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                  <div className="profile-edit-card text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#8a8ca3] mb-4 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#6c5ce7]" />
                      Profile Avatar
                    </div>

                    {/* Interactive 3D Avatar Upload */}
                    <div className="relative inline-block mb-3">
                      <div className="profile-avatar-uploader profile-avatar-uploader-3d">
                        {setupAvatarPreview ? (
                          <img src={setupAvatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-3xl font-black">
                            {setupFullName ? setupFullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DIU'}
                          </span>
                        )}
                        <label 
                          htmlFor="avatar-file-input" 
                          className="avatar-overlay"
                        >
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">Change Photo</span>
                        </label>
                      </div>

                      <input 
                        id="avatar-file-input"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarFileChange}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <label 
                        htmlFor="avatar-file-input"
                        className="text-xs font-bold text-[#6c5ce7] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload New
                      </label>
                      {setupAvatarPreview && (
                        <>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => setSetupAvatarPreview(null)}
                            className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </>
                      )}
                    </div>

                    {/* Preview Student Identity Card */}
                    <div className="pt-4 border-t border-[#f1f5f9] text-left space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8a8ca3]">
                        <span>Live Preview</span>
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200">
                          Live Sync
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] shadow-2xs">
                        <div className="font-bold text-sm text-[#1a1c2e] truncate">
                          {setupFullName || 'Student Name'}
                        </div>
                        <div className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1.5">
                          <span className="font-semibold text-[#6c5ce7]">{setupDepartment || 'Department'}</span>
                          <span>·</span>
                          <span>{setupBatch || 'Batch'}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#8a8ca3] mt-1.5 flex items-center gap-1">
                          <span className="text-[9.5px] uppercase font-bold bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">ID</span>
                          <span>{setupRoll || 'Not Set'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Stat Pill */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-purple-50/90 border border-purple-100/90 shadow-2xs">
                        <div className="text-xs font-black text-[#6c5ce7]">⚡ {currentUser.points}</div>
                        <div className="text-[10px] text-[#64748b] font-semibold">Total Points</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-orange-50/90 border border-orange-100/90 shadow-2xs">
                        <div className="text-xs font-black text-orange-600">🔥 {currentUser.current_streak}d</div>
                        <div className="text-[10px] text-[#64748b] font-semibold">Active Streak</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Academic & Social Forms (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Card 1: Academic Credentials */}
                  <div className="profile-edit-card space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#f1f5f9]">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6c5ce7] flex items-center justify-center shadow-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c2e]">Academic Credentials</h3>
                        <p className="text-[11px] text-[#8a8ca3]">Official university details verified for batch-wise leaderboards.</p>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="input-with-icon-wrap">
                        <div className="icon-leading-box">
                          <User className="w-4 h-4 text-[#6c5ce7]" />
                        </div>
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. Md. Sohan Ali"
                          value={setupFullName}
                          onChange={(e) => setSetupFullName(e.target.value)}
                          required
                          id="input-setup-fullname"
                        />
                      </div>
                    </div>

                    {/* Department & Batch Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Department <span className="text-rose-500">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <div className="icon-leading-box">
                            <Building2 className="w-4 h-4 text-[#6c5ce7]" />
                          </div>
                          <input 
                            type="text"
                            className="input-styled" 
                            placeholder="e.g. Department of CSE, SWE, EEE..."
                            value={setupDepartment}
                            onChange={(e) => setSetupDepartment(e.target.value)}
                            required
                            id="input-setup-dept"
                            autoComplete="off"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Batch Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="input-with-icon-wrap">
                          <div className="icon-leading-box">
                            <Hash className="w-4 h-4 text-[#6c5ce7]" />
                          </div>
                          <input 
                            type="text"
                            className="input-styled" 
                            placeholder="e.g. Batch 55, Batch 56, 63..."
                            value={setupBatch}
                            onChange={(e) => setSetupBatch(e.target.value)}
                            required
                            id="input-setup-batch"
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Student ID / Roll Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="input-with-icon-wrap">
                        <div className="icon-leading-box">
                          <Hash className="w-4 h-4 text-[#6c5ce7]" />
                        </div>
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. 221-15-5001"
                          value={setupRoll}
                          onChange={(e) => setSetupRoll(e.target.value)}
                          required
                          id="input-setup-roll"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Social & Peer Communication Contacts */}
                  <div className="profile-edit-card space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#f1f5f9]">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#1a1c2e]">Peer Contact &amp; Social Links</h3>
                        <p className="text-[11px] text-[#8a8ca3]">
                          Provide at least one channel so study peers and faculty can reach you directly.
                        </p>
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                        Facebook Profile URL or Username
                      </label>
                      <div className="input-with-icon-wrap">
                        <div className="icon-leading-box bg-[#1877f2]/10 text-[#1877f2]">
                          <span className="font-black text-sm">f</span>
                        </div>
                        <input 
                          type="text" 
                          className="input-styled" 
                          placeholder="e.g. facebook.com/sohanali or @sohanali"
                          value={setupFb}
                          onChange={(e) => setSetupFb(e.target.value)}
                          id="input-setup-fb"
                        />
                      </div>
                    </div>

                    {/* Telegram & WhatsApp Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          Telegram Handle / Username
                        </label>
                        <div className="input-with-icon-wrap">
                          <div className="icon-leading-box bg-[#0088cc]/10 text-[#0088cc]">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <input 
                            type="text" 
                            className="input-styled" 
                            placeholder="e.g. @sohanali or t.me/sohanali"
                            value={setupTelegram}
                            onChange={(e) => setSetupTelegram(e.target.value)}
                            id="input-setup-telegram"
                          />
                        </div>
                        <p className="text-[10px] text-[#8a8ca3] mt-1">Accepts username, @handle or link</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1e293b] mb-1.5">
                          WhatsApp Number or Username
                        </label>
                        <div className="input-with-icon-wrap">
                          <div className="icon-leading-box bg-[#25d366]/10 text-[#25d366]">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input 
                            type="text" 
                            className="input-styled" 
                            placeholder="e.g. +8801700000000 or @username / wa.me/..."
                            value={setupWhatsapp}
                            onChange={(e) => setSetupWhatsapp(e.target.value)}
                            id="input-setup-whatsapp"
                          />
                        </div>
                        <p className="text-[10px] text-[#8a8ca3] mt-1">Accepts phone number, username or link</p>
                      </div>
                    </div>
                  </div>

                  {/* Prominent 3D Action Card & Buttons */}
                  <div className="profile-edit-card mb-16 sm:mb-20 flex flex-col items-center justify-center gap-5 text-center">
                    <div className="text-xs sm:text-sm text-[#64748b] font-medium flex items-center gap-2 justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Changes are saved securely and synced live to your Supabase cloud profile.</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
                      {currentUser.profile_completed && (
                        <button
                          type="button"
                          onClick={() => setCurrentPage('profile')}
                          className="btn-setup-discard-3d min-w-[140px] sm:min-w-[160px] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold text-[#475569] cursor-pointer"
                        >
                          Discard
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="btn-setup-save-3d min-w-[200px] sm:min-w-[240px] px-8 sm:px-10 py-3.5 sm:py-4 text-white text-sm sm:text-base font-extrabold rounded-2xl flex items-center justify-center gap-3 cursor-pointer"
                        disabled={setupLoading}
                        id="btn-save-profile-setup"
                      >
                        {setupLoading ? (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                        <span>{currentUser.profile_completed ? 'Save Changes' : 'Save & Enter Skill Hub →'}</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* PAGE 3 — DISCOVER SKILLS & FIELDS */}
      {/* ========================================================================= */}
      {currentPage === 'discover' && (
        <div className="page" id="page-discover">
          <div className="page-tag">PAGE 3 — DISCOVER SKILLS &amp; FIELDS</div>

          <div className="content">
            
            {/* Real Dynamic Hero Banner */}
            <div className="hero-banner shadow-lg">
              <div className="hero-text">
                <h1>Level up your skills, {getMainName(currentUser.full_name)}.</h1>
                <p>Pick a roadmap, challenge your limits, beat the deadline and earn points to rank #1 in your batch.</p>
              </div>
              <HeroProgressCore3D 
                points={currentUser.points}
                streak={currentUser.current_streak}
                batchRank={userBatchRank}
              />
              <div className="hero-stats">
                <div className="stat">
                  <b>{currentUser.points}</b>
                  <span>points</span>
                </div>
                <div className="stat">
                  <b>{currentUser.current_streak}</b>
                  <span>day streak</span>
                </div>
                <div className="stat">
                  <b>{userBatchRank}</b>
                  <span>in batch</span>
                </div>
              </div>
            </div>

            {/* Active Challenge Banner in Discover (If user has an active challenge) */}
            {activeProgress && activeProgress.status === 'in_progress' && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#8075ff] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                    {skills.find(s => s.id === activeProgress.skill_id)?.icon || '⚡'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/80">Active Timed Challenge</div>
                    <div className="text-base font-bold">{skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}</div>
                    <div className="text-xs text-white/90 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {timeRemaining.isExpired 
                          ? 'Expired' 
                          : `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m remaining`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white text-[#6c5ce7] text-xs font-bold rounded-xl hover:bg-white/95 transition-colors shadow-sm"
                  >
                    Go to Challenge →
                  </button>
                  <button
                    onClick={handleCompleteActiveChallenge}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#00b894] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Complete (+10 pts)
                  </button>
                </div>
              </div>
            )}

            {/* Sub-view switcher for Discover */}
            {discoverView === 'main' && (
              <>
                {/* 2 Main Choice Cards: Browse by Field & Browse by Skill */}
                <div className="choice-grid" id="discover-choice-grid">
                  <div 
                    className="choice-card c1 cursor-pointer"
                    onClick={() => setDiscoverView('fields')}
                    id="card-browse-by-field"
                  >
                    <div className="icon-badge">🧭</div>
                    <h3>Browse by Field</h3>
                    <p>Explore roadmap tracks organized by software fields — Web, AI, DevOps, Mobile &amp; more.</p>
                  </div>

                  <div 
                    className="choice-card c2 cursor-pointer"
                    onClick={() => setDiscoverView('all-skills')}
                    id="card-browse-by-skill"
                  >
                    <div className="icon-badge">⚡</div>
                    <h3>Browse by Skill</h3>
                    <p>Pick a specific technology roadmap like React, Node.js, Python, Flutter &amp; more.</p>
                  </div>
                </div>

                {/* Search Bar (Line 1) */}
                <div className="search-wrapper w-full mb-3">
                  <span className="search-icon-inside">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search skills (HTML, React, Python, C++, Docker)..."
                    className="search-input-field"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="input-search-skills"
                  />
                </div>

                {/* Category / Fields Filter Row (Line 2) */}
                <div className="flex items-center gap-2 mb-2.5 overflow-hidden">
                  <div className="filter-pills-row flex-1">
                    <button 
                      onClick={() => setFieldFilter(null)}
                      className={`filter-pill-btn ${!fieldFilter ? 'active' : 'inactive'}`}
                      id="pill-filter-all-fields"
                    >
                      All Fields
                    </button>
                    {fields.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => setFieldFilter(f.id === fieldFilter ? null : f.id)}
                        className={`filter-pill-btn ${fieldFilter === f.id ? 'active-accent' : 'inactive'}`}
                        id={`pill-filter-${f.id}`}
                      >
                        {f.name}
                      </button>
                    ))}
                    <button 
                      onClick={() => setDiscoverView('fields')}
                      className="filter-pill-link"
                      id="btn-view-all-fields-link"
                    >
                      View all fields →
                    </button>
                  </div>
                </div>

                {/* Skills Row with All Skills option (Line 3) */}
                <div className="flex items-center gap-2 mb-6 overflow-hidden">
                  <div className="filter-pills-row flex-1">
                    <button 
                      onClick={() => setSkillFilter(null)}
                      className={`filter-pill-btn ${!skillFilter ? 'active-accent' : 'inactive'} flex items-center gap-1.5`}
                      id="pill-all-skills-option"
                    >
                      <span>⚡ All Skills</span>
                    </button>
                    {skills.slice(0, 10).map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSkillFilter(skillFilter === s.id ? null : s.id)}
                        className={`filter-pill-btn ${skillFilter === s.id ? 'active-accent' : 'inactive'} flex items-center gap-1.5`}
                        id={`pill-quick-skill-${s.id}`}
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => setDiscoverView('all-skills')}
                      className="filter-pill-link"
                      id="btn-view-all-skills-link"
                    >
                      Explore all {skills.length} skills →
                    </button>
                  </div>
                </div>

                {/* Popular Skill Tracks Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="section-title" style={{ margin: 0 }}>
                    {skillFilter 
                      ? `Selected Skill: ${skills.find(s => s.id === skillFilter)?.name || ''}` 
                      : fieldFilter 
                        ? `${fields.find(f => f.id === fieldFilter)?.name || ''} Roadmaps`
                        : 'Popular Roadmap Tracks'}
                  </div>
                  <div className="flex items-center gap-3">
                    {(skillFilter || fieldFilter || searchQuery) && (
                      <button
                        onClick={() => {
                          setSkillFilter(null);
                          setFieldFilter(null);
                          setSearchQuery('');
                        }}
                        className="text-xs text-[#e84393] font-bold cursor-pointer hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                    <span 
                      onClick={() => setDiscoverView('all-skills')}
                      className="text-xs text-[#6c5ce7] font-bold cursor-pointer hover:underline"
                    >
                      View all {skills.length} skills →
                    </span>
                  </div>
                </div>

                <div className="skills-grid">
                  {skills
                    .filter(s => !fieldFilter || s.field_id === fieldFilter)
                    .filter(s => !skillFilter || s.id === skillFilter)
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => {
                      const isActive = activeProgress?.skill_id === s.id && activeProgress?.status === 'in_progress';
                      return (
                        <div 
                          key={s.id} 
                          className="skill-card group hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedSkillId(s.id);
                            setCurrentPage('roadmap');
                          }}
                          id={`skill-card-${s.id}`}
                        >
                          <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                            {s.icon}
                          </div>
                          <h4>{s.name}</h4>
                          <p>{s.description}</p>
                          <div className="meta">
                            <span className="diff">{s.difficulty || 'Beginner'}</span>
                            <span className="learners">
                              {isActive ? '⚡ In progress' : `⏱ ${s.avg_days || '3 days'}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {skills.filter(s => (!fieldFilter || s.field_id === fieldFilter) && (!skillFilter || s.id === skillFilter) && (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#e4e5ee] my-4">
                    <span className="text-3xl block mb-2">⚡</span>
                    <div className="text-sm font-bold text-[#1a1c2e]">No skills available yet.</div>
                    <p className="text-xs text-[#8a8ca3] mt-1">
                      {skills.length === 0 ? 'Skills will appear here once configured in the database.' : 'No skills matched your filter criteria.'}
                    </p>
                  </div>
                )}

                {/* Category Exploration Banner */}
                <div className="mt-10 mb-4 section-title">Explore by Domain</div>
                {fields.length === 0 ? (
                  <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-[#e4e5ee]">
                    <span className="text-2xl block mb-1">🧭</span>
                    <div className="text-sm font-bold text-[#1a1c2e]">No fields available yet.</div>
                    <p className="text-xs text-[#8a8ca3] mt-1">Field categories will appear once created in the database.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {fields.map(f => (
                      <div 
                        key={f.id}
                        onClick={() => {
                          setSelectedFieldId(f.id);
                          setDiscoverView('field-skills');
                        }}
                        className="domain-card-item p-5 rounded-2xl bg-white border border-[#e4e5ee] hover:border-[#6c5ce7] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="domain-card-icon text-2xl">{f.icon}</span>
                          <div>
                            <div className="font-bold text-sm text-[#1a1c2e]">{f.name}</div>
                            <div className="text-xs text-[#8a8ca3]">{skills.filter(s => s.field_id === f.id).length} Roadmaps</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8a8ca3]" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Sub-view: All Fields */}
            {discoverView === 'fields' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('main')}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 mb-5 rounded-xl bg-white text-slate-800 hover:text-[#6c5ce7] font-bold text-xs sm:text-sm border-2 border-indigo-100/90 hover:border-[#6c5ce7] shadow-xs hover:shadow-md hover:-translate-x-1 transition-all duration-200 group cursor-pointer"
                  id="btn-back-to-discover-fields"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#6c5ce7] group-hover:bg-[#6c5ce7] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                  <span className="tracking-tight">Back to Discover</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-[#6c5ce7] transition-colors ml-0.5">
                    Overview
                  </span>
                </button>
                <div className="section-title">All Engineering Disciplines</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {fields.map(f => (
                    <div 
                      key={f.id}
                      onClick={() => {
                        setSelectedFieldId(f.id);
                        setDiscoverView('field-skills');
                      }}
                      className="p-5 rounded-2xl bg-white border border-[#e4e5ee] hover:border-[#6c5ce7] transition-all cursor-pointer shadow-xs hover:shadow-md"
                    >
                      <span className="text-3xl block mb-2">{f.icon}</span>
                      <div className="font-bold text-base text-[#1a1c2e] mb-1">{f.name}</div>
                      <div className="text-xs text-[#8a8ca3] mb-3">{f.description}</div>
                      <div className="text-xs font-bold text-[#6c5ce7] flex items-center gap-1">
                        View {skills.filter(s => s.field_id === f.id).length} Tracks <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: Skills in Selected Field */}
            {discoverView === 'field-skills' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('fields')}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 mb-5 rounded-xl bg-white text-slate-800 hover:text-[#6c5ce7] font-bold text-xs sm:text-sm border-2 border-indigo-100/90 hover:border-[#6c5ce7] shadow-xs hover:shadow-md hover:-translate-x-1 transition-all duration-200 group cursor-pointer"
                  id="btn-back-to-disciplines"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#6c5ce7] group-hover:bg-[#6c5ce7] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                  <span className="tracking-tight">Back to Disciplines</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-[#6c5ce7] transition-colors ml-0.5">
                    Fields
                  </span>
                </button>
                <div className="section-title">
                  {fields.find(f => f.id === selectedFieldId)?.name || 'Field'} Roadmaps
                </div>
                <div className="skills-grid">
                  {skills.filter(s => s.field_id === selectedFieldId).map(s => (
                    <div 
                      key={s.id}
                      className="skill-card cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        setCurrentPage('roadmap');
                      }}
                    >
                      <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                        {s.icon}
                      </div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                      <div className="meta">
                        <span className="diff">{s.difficulty || 'Beginner'}</span>
                        <span className="learners">⏱ {s.avg_days || '3 days'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-view: All Skills */}
            {discoverView === 'all-skills' && (
              <div>
                <button 
                  onClick={() => setDiscoverView('main')}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 mb-5 rounded-xl bg-white text-slate-800 hover:text-[#6c5ce7] font-bold text-xs sm:text-sm border-2 border-indigo-100/90 hover:border-[#6c5ce7] shadow-xs hover:shadow-md hover:-translate-x-1 transition-all duration-200 group cursor-pointer"
                  id="btn-back-to-discover-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#6c5ce7] group-hover:bg-[#6c5ce7] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                  <span className="tracking-tight">Back to Discover</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-[#6c5ce7] transition-colors ml-0.5">
                    Overview
                  </span>
                </button>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                  <div className="section-title" style={{ margin: 0 }}>All Available Roadmap Tracks ({skills.length})</div>
                  <div className="search-wrapper max-w-sm">
                    <span className="search-icon-inside">
                      <Search className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      placeholder="Filter all roadmaps..."
                      className="search-input-field"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="skills-grid">
                  {skills
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(s => (
                    <div 
                      key={s.id}
                      className="skill-card cursor-pointer hover:shadow-md transition-all"
                      onClick={() => {
                        setSelectedSkillId(s.id);
                        setCurrentPage('roadmap');
                      }}
                    >
                      <div className="icon" style={{ background: s.bg_color || '#6c5ce7' }}>
                        {s.icon}
                      </div>
                      <h4>{s.name}</h4>
                      <p>{s.description}</p>
                      <div className="meta">
                        <span className="diff">{s.difficulty || 'Beginner'}</span>
                        <span className="learners">⏱ {s.avg_days || '3 days'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4 & 5 — ROADMAP STEPS & OVERVIEW */}
      {/* ========================================================================= */}
      {currentPage === 'roadmap' && (
        <div className="page" id="page-roadmap">
          <div className="page-tag">PAGE 4 &amp; 5 — ROADMAP STEPS &amp; OVERVIEW</div>

          <div className="content">
            
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <button 
                onClick={() => setCurrentPage('discover')}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white text-slate-800 hover:text-[#6c5ce7] font-bold text-xs sm:text-sm border-2 border-indigo-100/90 hover:border-[#6c5ce7] shadow-xs hover:shadow-md hover:-translate-x-1 transition-all duration-200 group cursor-pointer"
                id="btn-back-to-discover"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#6c5ce7] group-hover:bg-[#6c5ce7] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="tracking-tight">Back to Discover &amp; Roadmaps</span>
              </button>
              <div className="roadmap-track-badge text-xs text-[#8a8ca3] font-medium hidden sm:block">
                Skill Track: <span className="font-bold text-[#1a1c2e]">{currentSkill.name}</span> ({currentSkillSteps.length} milestones)
              </div>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              
              {/* Header info */}
              <div className="roadmap-header-card p-6 sm:p-7 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="skill-3d-badge w-14 h-14 min-w-14 rounded-2xl text-white font-extrabold flex items-center justify-center text-2xl"
                    style={{ background: currentSkill.bg_color || '#6c5ce7' }}
                  >
                    {currentSkill.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-2xl text-[#1a1c2e] leading-tight">{currentSkill.name}</h3>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#f1eefe] text-[#6c5ce7] border border-[#6c5ce7]/20 shadow-2xs">
                        {currentSkill.difficulty || 'Beginner'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8a8ca3] max-w-2xl leading-relaxed whitespace-normal break-words">{currentSkill.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {activeProgress?.skill_id === currentSkill.id && activeProgress?.status === 'in_progress' ? (
                    <button 
                      onClick={() => setCurrentPage('dashboard')}
                      className="btn-challenge-active w-full sm:w-auto"
                      id="btn-active-challenge-dashboard"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>⚡ Active Challenge (Go to Dashboard)</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsDeadlineModalOpen(true)}
                      className="btn-challenge-cta w-full sm:w-auto"
                      id="btn-start-challenge-roadmap"
                    >
                      <Zap className="w-5 h-5 fill-white" />
                      <span>Start Timed Challenge</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </button>
                  )}
                </div>
              </div>

              {/* Steps List */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="section-title" style={{ margin: 0 }}>Roadmap Curriculum &amp; Milestones</div>
                <span className="text-xs text-[#8a8ca3] font-semibold">{currentSkillSteps.length} Steps to Complete</span>
              </div>

              {currentSkillSteps.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-[#8a8ca3] text-xs border border-[#e4e5ee] shadow-2xs">
                  No roadmap steps listed yet for this skill track.
                </div>
              ) : (
                <div className="roadmap-journey-track space-y-3">
                  {currentSkillSteps.map((st, idx) => (
                    <div key={st.id} className="step-card" id={`step-card-${st.id}`}>
                      <div className="step-num">{idx + 1}</div>
                      <div className="step-body">
                        <h5>{st.title}</h5>
                        <p>{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dedicated Official Documentation & References Section */}
              <SkillResourcesSection
                skill={currentSkill}
                resources={skillResources[currentSkill.id] || []}
                isAdmin={Boolean(currentUser?.is_admin)}
                onAddResource={() => setIsResourceModalOpen(true)}
                onDeleteResource={(resId) => handleDeleteResource(resId, currentSkill.id)}
              />

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 6 — DASHBOARD / ACTIVE CHALLENGE */}
      {/* ========================================================================= */}
      {currentPage === 'dashboard' && (
        <div className="page" id="page-dashboard">
          <div className="page-tag">PAGE 6 — DASHBOARD / ACTIVE CHALLENGE</div>

          <div className="content w-full max-w-5xl mx-auto">
            
            {/* Real Stats Mini Grid */}
            <div className="stat-mini-grid mb-6">
              <div className="stat-mini stat-mini-points">
                <div className="stat-mini-top">
                  <div className="stat-mini-icon-3d stat-icon-points">
                    <Zap className="w-4 h-4 text-purple-600 fill-purple-500/20" />
                  </div>
                  <div className="stat-mini-tag">XP</div>
                </div>
                <div className="val">{currentUser.points}</div>
                <div className="lbl">total points</div>
              </div>

              <div className="stat-mini stat-mini-streak">
                <div className="stat-mini-top">
                  <div className="stat-mini-icon-3d stat-icon-streak">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30" />
                  </div>
                  <div className="stat-mini-tag stat-tag-streak">STREAK</div>
                </div>
                <div className="val">{currentUser.current_streak} days</div>
                <div className="lbl">current streak</div>
              </div>

              <div className="stat-mini stat-mini-skills">
                <div className="stat-mini-top">
                  <div className="stat-mini-icon-3d stat-icon-skills">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="stat-mini-tag stat-tag-skills">NODES</div>
                </div>
                <div className="val">
                  {allCompletedProgress.filter(cp => cp.user_id === currentUser.id).length}
                </div>
                <div className="lbl">skills completed</div>
              </div>

              <div className="stat-mini stat-mini-rank">
                <div className="stat-mini-top">
                  <div className="stat-mini-icon-3d stat-icon-rank">
                    <Trophy className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                  </div>
                  <div className="stat-mini-tag stat-tag-rank">CAMPUS</div>
                </div>
                <div className="val">{userBatchRank}</div>
                <div className="lbl">batch rank</div>
              </div>
            </div>

            {/* Active Challenge Card */}
            {activeProgress && activeProgress.status === 'in_progress' ? (
              <>
                <div className="active-card shadow-xs border border-[#e4e5ee]" id="dashboard-active-challenge-card">
                  
                  {/* Header info */}
                <div className="active-card-top pb-4 border-b border-[#f0f1f7]">
                  <div className="active-card-title min-w-0 flex-1">
                    <span 
                      className="skill-3d-badge w-12 h-12 min-w-12 rounded-xl text-white font-extrabold flex items-center justify-center text-xl"
                      style={{ background: skills.find(s => s.id === activeProgress.skill_id)?.bg_color || '#6c5ce7' }}
                    >
                      {skills.find(s => s.id === activeProgress.skill_id)?.icon || '⚡'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-extrabold text-lg text-[#1a1c2e] leading-tight truncate">
                          {skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f1eefe] text-[#6c5ce7] border border-[#6c5ce7]/20 shadow-2xs">
                          Active Challenge
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e6faf5] text-[#00b894] border border-[#00b894]/20 shadow-2xs">
                          {skills.find(s => s.id === activeProgress.skill_id)?.difficulty || 'Sprint'}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8ca3] whitespace-normal break-words leading-relaxed">
                        {skills.find(s => s.id === activeProgress.skill_id)?.description || 'Finish all checkpoints before the deadline to earn points & streak!'}
                      </p>
                    </div>
                  </div>
                  <div className="active-badge self-start sm:self-auto shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#00b894] animate-pulse"></span>
                    <span>LIVE CHALLENGE</span>
                  </div>
                </div>

                {/* Real Live Countdown Timer */}
                <div className="my-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-[#8a8ca3] uppercase tracking-wider">Time Remaining:</span>
                    <span className="text-xs font-extrabold text-[#6c5ce7] bg-[#f1eefe] px-2.5 py-0.5 rounded-full border border-[#6c5ce7]/20">
                      {timeRemaining.percent}% time left
                    </span>
                  </div>
                  
                  <div className="countdown-grid">
                    <div className="count-unit">
                      <b>{String(timeRemaining.days).padStart(2, '0')}</b>
                      <span>Days</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.hours).padStart(2, '0')}</b>
                      <span>Hours</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.minutes).padStart(2, '0')}</b>
                      <span>Mins</span>
                    </div>
                    <div className="count-unit">
                      <b>{String(timeRemaining.seconds).padStart(2, '0')}</b>
                      <span>Secs</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#f0f1f7] h-3 rounded-full overflow-hidden border border-[#e4e5ee] mt-3.5 p-0.5 shadow-inner">
                    <div 
                      className="bg-linear-to-r from-[#6c5ce7] via-[#8477f3] to-[#a29bfe] h-full rounded-full transition-all duration-1000 shadow-xs"
                      style={{ width: `${timeRemaining.percent}%` }}
                    />
                  </div>
                </div>

                {/* Roadmap Curriculum & Milestones for Active Challenge */}
                <div className="mb-6 pt-4 border-t border-[#f0f1f7]">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <div className="section-title" style={{ fontSize: '14px', margin: 0 }}>
                        Roadmap Curriculum &amp; Milestones
                      </div>
                      <p className="text-xs text-[#8a8ca3] mt-0.5">
                        Follow each curriculum step and check off your completed milestones as you build.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 bg-[#f7f8fc] border border-[#e4e5ee] rounded-md text-[#1a1c2e] shadow-2xs">
                        {(activeProgress.steps_completed || []).length} / {(roadmapSteps[activeProgress.skill_id] || []).length} Steps Completed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(roadmapSteps[activeProgress.skill_id] || []).map((step, idx) => {
                      const isChecked = (activeProgress.steps_completed || []).includes(step.step_order);
                      return (
                        <div 
                          key={step.id}
                          onClick={() => handleToggleStep(step.step_order)}
                          className={`milestone-check-card p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${isChecked ? 'milestone-checked bg-[#00b894]/8 border-[#00b894]/40 shadow-xs' : 'bg-white border-[#e4e5ee] hover:border-[#6c5ce7] hover:bg-[#fafbff]'}`}
                        >
                          <div className={`milestone-checkbox w-5 h-5 min-w-5 rounded-md mt-0.5 flex items-center justify-center text-xs font-extrabold transition-all ${isChecked ? 'bg-[#00b894] text-white shadow-2xs' : 'border-2 border-[#c8cad6] text-transparent'}`}>
                            ✓
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                              <div className={`text-sm font-bold ${isChecked ? 'text-[#00b894] line-through' : 'text-[#1a1c2e]'}`}>
                                Step {idx + 1}: {step.title}
                              </div>
                              {isChecked && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#00b894]/15 text-[#00b894] border border-[#00b894]/30 shadow-2xs">
                                  Completed
                                </span>
                              )}
                            </div>

                            {step.description && (
                              <p className={`text-xs leading-relaxed whitespace-normal break-words mt-1 ${isChecked ? 'text-[#00b894]/80' : 'text-[#5a5c73]'}`}>
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Challenge Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-[#f0f1f7]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button 
                      onClick={handleCompleteActiveChallenge}
                      className="btn-complete-3d px-5 py-3 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer select-none"
                      id="btn-complete-challenge"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Challenge (+10 pts)</span>
                    </button>

                    <button 
                      onClick={() => setIsAddTimeModalOpen(true)}
                      className="btn-secondary-3d px-4 py-3 bg-white border border-[#e4e5ee] text-[#1a1c2e] hover:bg-[#f4f5f8] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none"
                      id="btn-add-extra-time"
                    >
                      <Clock className="w-4 h-4 text-[#6c5ce7]" />
                      <span>Add Extra Time</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    className="btn-cancel-3d px-4 py-2.5 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 text-xs font-bold rounded-xl transition-all text-center sm:text-right cursor-pointer select-none"
                    id="btn-cancel-challenge"
                  >
                    Cancel Challenge
                  </button>
                </div>

              </div>

              {/* Official Documentation & Reference for Active Challenge */}
              {(() => {
                const activeSkillObj = skills.find(s => s.id === activeProgress.skill_id) || currentSkill;
                return (
                  <SkillResourcesSection
                    skill={activeSkillObj}
                    resources={skillResources[activeProgress.skill_id] || []}
                    isAdmin={Boolean(currentUser?.is_admin)}
                    onAddResource={() => {
                      setSelectedSkillId(activeProgress.skill_id);
                      setIsResourceModalOpen(true);
                    }}
                    onDeleteResource={(resId) => handleDeleteResource(resId, activeProgress.skill_id)}
                    className="mb-8 mt-0"
                  />
                );
              })()}
              </>
            ) : (
              <div className="empty-state-3d bg-white border border-[#e4e5ee] rounded-2xl p-8 mb-8 text-center shadow-xs">
                <div className="empty-icon-3d w-14 h-14 rounded-2xl bg-linear-to-br from-[#6c5ce7]/15 to-[#a29bfe]/20 text-[#6c5ce7] mx-auto flex items-center justify-center mb-3.5 border border-[#6c5ce7]/20 shadow-2xs">
                  <Flame className="w-7 h-7 text-[#6c5ce7]" />
                </div>
                <h4 className="font-extrabold text-lg text-[#1a1c2e] mb-1.5">No Active Timed Challenge</h4>
                <p className="text-xs text-[#8a8ca3] max-w-sm mx-auto mb-5 whitespace-normal leading-relaxed">
                  Select a skill track from the discover roadmaps and set your custom sprint deadline to earn +10 points and build your streak.
                </p>
                <button 
                  onClick={() => setCurrentPage('discover')}
                  className="btn-challenge-cta inline-flex items-center gap-2 px-6 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                >
                  <span>Pick a Skill to Learn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Badges & History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: Badges Unlocked */}
              <div>
                <div className="section-title">Milestones &amp; Badges</div>
                <div className="badge-grid">
                  {badges.map((badge) => {
                    const isUnlocked = userBadgeIds.includes(badge.id);

                    return (
                      <div 
                        key={badge.id}
                        className={`badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}
                      >
                        <div 
                          className="badge-circle" 
                          style={{ background: isUnlocked ? (badge.bg_color || '#6c5ce7') : '#b2bec3' }}
                        >
                          {isUnlocked ? (badge.icon_symbol || '★') : '🔒'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="flex items-center gap-1.5">
                            <span>{badge.name}</span>
                            {isUnlocked && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                                Unlocked
                              </span>
                            )}
                          </h5>
                          <p className="whitespace-normal break-words">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Completed Skills History */}
              <div>
                <div className="section-title">Completed Skills History</div>
                {allCompletedProgress.filter(cp => cp.user_id === currentUser.id).length > 0 ? (
                  allCompletedProgress
                    .filter(cp => cp.user_id === currentUser.id)
                    .map((cs) => {
                      const sk = skills.find(s => s.id === cs.skill_id) || { name: 'Skill', icon: 'S', bg_color: '#6c5ce7' };
                      return (
                        <div key={cs.id} className="completed-skill-card">
                          <div className="icon skill-3d-badge" style={{ background: sk.bg_color || '#e84393' }}>
                            {sk.icon || 'S'}
                          </div>
                          <div className="info min-w-0 flex-1">
                            <h5>{sk.name}</h5>
                            <p className="whitespace-normal break-words">Finished on time (+10 pts)</p>
                          </div>
                          <div className="time-badge rounded-md shadow-2xs font-extrabold">Completed</div>
                        </div>
                      );
                    })
                ) : (
                  <div className="bg-white border border-[#e4e5ee] rounded-2xl p-6 text-center text-xs text-[#8a8ca3] shadow-2xs">
                    No completed challenges yet. Finish your active sprint to earn your first completion badge!
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 7 — LEADERBOARD */}
      {/* ========================================================================= */}
      {currentPage === 'leaderboard' && (() => {
        const userRank = filteredLeaderboardProfiles.findIndex(p => p.id === currentUser.id) + 1;
        const batchTabs = [
          { id: 'All departments', label: 'All Students' },
          { id: 'Batch 55', label: 'Batch 55' },
          { id: 'Batch 56', label: 'Batch 56' },
          { id: 'Batch 57', label: 'Batch 57' },
        ];

        return (
          <div className="page" id="page-leaderboard">
            <div className="page-tag">PAGE 7 — LEADERBOARD</div>

            <div className="content w-full max-w-5xl mx-auto">
              
              {/* Leaderboard Header Banner */}
              <div className="lb-header-banner bg-white border border-[#e4e5ee] rounded-2xl p-5 sm:p-6 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="lb-trophy-icon-3d w-9 h-9 rounded-xl bg-linear-to-br from-amber-400/20 to-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-400/30 shadow-2xs">
                      <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#1a1c2e] tracking-tight">
                      Campus Leaderboard
                    </h2>
                  </div>
                  <p className="text-xs text-[#8a8ca3] max-w-md leading-relaxed">
                    Live peer rankings based on completed skill challenges and streak consistency.
                  </p>
                </div>

                {/* User's quick rank status */}
                <div className="lb-user-status-card flex items-center gap-2.5 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-xl self-stretch sm:self-auto justify-between sm:justify-start shadow-2xs">
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-[#8a8ca3] tracking-wider">Your Position</div>
                    <div className="text-sm font-black text-[#1a1c2e] flex items-center gap-1.5">
                      {userRank > 0 ? (
                        <span className="text-[#6c5ce7] font-extrabold">#{userRank} on Board</span>
                      ) : (
                        <span className="text-[#8a8ca3]">Unranked</span>
                      )}
                    </div>
                  </div>
                  <div className="w-[1px] h-7 bg-[#e2e8f0] mx-1" />
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] uppercase font-bold text-[#8a8ca3] tracking-wider">Total Score</div>
                    <div className="text-sm font-black text-[#6c5ce7] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#6c5ce7] fill-[#6c5ce7]/20" />
                      {currentUser.points} pts
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="lb-filter-row">
                {batchTabs.map(tab => {
                  const count = tab.id === 'All departments' 
                    ? profiles.length 
                    : profiles.filter(p => p.batch_number === tab.id).length;
                  const isActive = selectedBatchFilter === tab.id;

                  return (
                    <button 
                      key={tab.id}
                      type="button"
                      className={`lb-filter-btn cursor-pointer select-none ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedBatchFilter(tab.id)}
                      id={`btn-lb-filter-${tab.id.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Top 3 3D Podium */}
              {filteredLeaderboardProfiles.length > 0 && (
                <div className="podium-container">
                  
                  {/* #2 Silver (Left) */}
                  {top2 && (
                    <div 
                      className="podium-col silver"
                      onClick={() => handleOpenUserProfile(top2.id)}
                      id="podium-rank-2"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="podium-medal-icon medal-silver">🥈</div>
                        <div className="avatar-big">
                          {top2.avatar_url ? (
                            <img src={top2.avatar_url} alt={top2.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top2.id === currentUser.id ? 'YO' : top2.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="podium-tier-label">SILVER</span>
                        <div className="podium-rank-num">2</div>
                      </div>

                      <div className="pname">
                        {top2.id === currentUser.id ? `${top2.full_name} (You)` : top2.full_name}
                      </div>
                      <div className="pmeta">
                        {top2.department} · {top2.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥈 {top2.points} pts
                      </div>
                    </div>
                  )}

                  {/* #1 Gold (Center) */}
                  {top1 && (
                    <div 
                      className="podium-col gold"
                      onClick={() => handleOpenUserProfile(top1.id)}
                      id="podium-rank-1"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="podium-crown-icon">👑</div>
                        <div className="avatar-big">
                          {top1.avatar_url ? (
                            <img src={top1.avatar_url} alt={top1.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top1.id === currentUser.id ? 'YO' : top1.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="podium-tier-label">CHAMPION</span>
                        <div className="podium-rank-num">1</div>
                      </div>

                      <div className="pname">
                        {top1.id === currentUser.id ? `${top1.full_name} (You)` : top1.full_name}
                      </div>
                      <div className="pmeta">
                        {top1.department} · {top1.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥇 {top1.points} pts
                      </div>
                    </div>
                  )}

                  {/* #3 Bronze (Right) */}
                  {top3 && (
                    <div 
                      className="podium-col bronze"
                      onClick={() => handleOpenUserProfile(top3.id)}
                      id="podium-rank-3"
                    >
                      <div className="podium-avatar-wrap">
                        <div className="podium-medal-icon medal-bronze">🥉</div>
                        <div className="avatar-big">
                          {top3.avatar_url ? (
                            <img src={top3.avatar_url} alt={top3.full_name} className="w-full h-full object-cover" />
                          ) : (
                            top3.id === currentUser.id ? 'YO' : top3.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)
                          )}
                        </div>
                      </div>
                      
                      <div className="podium-block">
                        <span className="podium-tier-label">BRONZE</span>
                        <div className="podium-rank-num">3</div>
                      </div>

                      <div className="pname">
                        {top3.id === currentUser.id ? `${top3.full_name} (You)` : top3.full_name}
                      </div>
                      <div className="pmeta">
                        {top3.department} · {top3.batch_number}
                      </div>
                      <div className="ppts-pill">
                        🥉 {top3.points} pts
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Ranked List Table */}
              {filteredLeaderboardProfiles.length === 0 ? (
                <div className="bg-white border border-[#e4e5ee] rounded-2xl p-10 text-center shadow-xs">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#1a1c2e]">No students in this batch yet</h3>
                  <p className="text-xs text-[#8a8ca3] max-w-sm mx-auto mt-1 mb-4">
                    Be the first in this cohort to finish a skill challenge and take the top spot!
                  </p>
                  <button 
                    onClick={() => setCurrentPage('discover')} 
                    className="px-5 py-2.5 bg-[#6c5ce7] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-[#6c5ce7]/20"
                  >
                    Explore Roadmaps →
                  </button>
                </div>
              ) : (
                <div className="lb-table-card">
                  {/* Table Header */}
                  <div className="lb-table-header">
                    <div>Rank</div>
                    <div>Student</div>
                    <div className="hidden sm:block">Cohort & Track</div>
                    <div className="hidden sm:block text-center">Streak</div>
                    <div className="text-right">Points</div>
                  </div>

                  {/* Table Rows */}
                  {filteredLeaderboardProfiles.map((p, idx) => {
                    const rank = idx + 1;
                    const isYou = p.id === currentUser.id;
                    const initials = isYou ? 'YO' : p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);

                    return (
                      <div 
                        key={p.id} 
                        className={`lb-row-item ${isYou ? 'is-current-user' : ''}`}
                        onClick={() => handleOpenUserProfile(p.id)}
                        id={`lb-row-rank-${rank}`}
                      >
                        {/* Rank Badge */}
                        <div>
                          <div className={`lb-rank-badge ${
                            rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other'
                          }`}>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                          </div>
                        </div>

                        {/* Student Name & Avatar */}
                        <div className="lb-student-info">
                          <div 
                            className="lb-student-avatar"
                            style={{ 
                              background: rank === 1 ? '#f59e0b' : (isYou ? '#6c5ce7' : '#1e293b')
                            }}
                          >
                            {p.avatar_url ? (
                              <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="lb-student-name">
                              <span>{p.full_name}</span>
                              {isYou && <span className="lb-you-tag">YOU</span>}
                            </div>
                            <div className="text-[11px] text-[#8a8ca3] sm:hidden truncate">
                              {p.department} · {p.batch_number}
                            </div>
                          </div>
                        </div>

                        {/* Department / Batch (Desktop) */}
                        <div className="hidden sm:block lb-dept-pill truncate">
                          {p.department} · <span className="text-[#1a1c2e] font-bold">{p.batch_number}</span>
                        </div>

                        {/* Streak (Desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          {p.current_streak > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200/60">
                              🔥 {p.current_streak}d
                            </span>
                          ) : (
                            <span className="text-xs text-[#cbd5e1]">-</span>
                          )}
                        </div>

                        {/* Total Points */}
                        <div className="lb-points-val justify-end">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{p.points}</span>
                          <span className="text-[11px] text-[#8a8ca3] font-normal hidden sm:inline">pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* PAGE 8 — PUBLIC PROFILE */}
      {/* ========================================================================= */}
      {currentPage === 'profile' && (() => {
        const isOwn = targetProfile.id === currentUser?.id;
        const targetCompletedSkills = selectedUserCompletedProgress;

        return (
          <div className="page" id="page-profile">
            <div className="page-tag">PAGE 8 — PUBLIC PROFILE</div>

            <div className="content w-full max-w-5xl mx-auto">
              
              {/* Back Navigation Bar */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <button 
                  onClick={() => setCurrentPage('leaderboard')}
                  className="btn-secondary-3d px-3.5 py-2 bg-white border border-[#e4e5ee] text-[#1a1c2e] hover:bg-[#f4f5f8] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
                  id="btn-back-to-leaderboard"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Leaderboard</span>
                </button>

                <div className="flex items-center gap-2">
                  {isOwn && (
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/20 shadow-2xs">
                      ✨ Your Public Profile
                    </span>
                  )}
                  {targetProfile.is_admin && (
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-600" /> Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Hero Card 2.5D */}
              <div className="profile-hero shadow-lg relative overflow-hidden" id="profile-hero-card">
                {/* 3D Elevated Avatar Frame */}
                <div className="profile-avatar-3d-wrap">
                  <div className="profile-avatar-big" id="profile-hero-avatar">
                    {targetProfile.avatar_url ? (
                      <img src={targetProfile.avatar_url} alt={targetProfile.full_name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      targetProfile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => setCurrentPage('profile-setup')}
                      className="profile-avatar-edit-badge"
                      title="Change avatar & details"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>

                {/* Profile Hero Info */}
                <div className="profile-hero-info flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                      {targetProfile.full_name}
                    </h2>
                    {isOwn && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs border border-white/30">
                        YOU
                      </span>
                    )}
                  </div>
                  
                  <div className="profile-hero-subline flex items-center gap-2 mt-1.5 justify-center sm:justify-start flex-wrap text-white/90 text-xs sm:text-sm">
                    <span className="font-semibold">{targetProfile.department || 'DIU Student'}</span>
                    <span>·</span>
                    <span>{targetProfile.batch_number || 'General Batch'}</span>
                    {targetProfile.roll_number && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-white/80">ID: {targetProfile.roll_number}</span>
                      </>
                    )}
                  </div>

                  {/* Action row on desktop hero */}
                  <div className="flex items-center gap-2 mt-3.5 justify-center sm:justify-start flex-wrap">
                    {isOwn ? (
                      <button
                        onClick={() => setCurrentPage('profile-setup')}
                        className="profile-hero-btn-edit flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#6c5ce7] font-bold text-xs shadow-xs hover:bg-white/90 transition-all cursor-pointer select-none"
                        id="btn-hero-edit-profile"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Edit Profile &amp; Socials</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-white/90" />
                        <span>Daffodil International University</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3D Elevated Hero Stat Tiles */}
                <div className="profile-hero-stats">
                  <div className="profile-stat-3d stat">
                    <div className="profile-stat-icon">
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                    </div>
                    <b>{targetProfile.points}</b>
                    <span>points</span>
                  </div>

                  <div className="profile-stat-3d stat">
                    <div className="profile-stat-icon">
                      <Flame className="w-4 h-4 text-orange-300 fill-orange-300/30" />
                    </div>
                    <b>{targetProfile.current_streak}</b>
                    <span>day streak</span>
                  </div>

                  <div className="profile-stat-3d stat">
                    <div className="profile-stat-icon">
                      <Trophy className="w-4 h-4 text-yellow-300 fill-yellow-300/30" />
                    </div>
                    <b>{targetBatchRank}</b>
                    <span>in batch</span>
                  </div>
                </div>
              </div>

              {/* Profile Grid (Left Details + Right Skills) */}
              <div className="profile-grid">
                
                {/* Left Column: Academic Credentials & Contact Channels */}
                <div>
                  <div className="info-card profile-card-3d" id="profile-details-card">
                    <div className="section-title flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-[#6c5ce7]/10 text-[#6c5ce7] flex items-center justify-center text-xs font-black">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span>Student Identity &amp; Details</span>
                    </div>

                    <div className="profile-info-rows-list space-y-1">
                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#6c5ce7]" />
                          <span>University</span>
                        </span>
                        <span className="text-xs font-bold text-[#1a1c2e] text-right">
                          Daffodil Int. University
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Department</span>
                        </span>
                        <span className="text-xs font-bold text-[#1a1c2e] text-right">
                          {targetProfile.department || 'CSE'}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span>Batch</span>
                        </span>
                        <span className="text-xs font-bold text-[#1a1c2e] text-right">
                          {targetProfile.batch_number || 'General'}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span>Roll / Student ID</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-[#1a1c2e] text-right">
                          {targetProfile.roll_number || 'Not provided'}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Skills completed</span>
                        </span>
                        <span className="text-xs font-extrabold text-[#6c5ce7] text-right">
                          {targetCompletedSkills.length}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="flex items-center gap-1.5 text-xs text-[#8a8ca3]">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span>Longest streak</span>
                        </span>
                        <span className="text-xs font-extrabold text-orange-600 text-right">
                          {targetProfile.longest_streak || targetProfile.current_streak} days
                        </span>
                      </div>
                    </div>

                    {/* Social & Peer Communication Contacts */}
                    <div className="pt-4 mt-4 border-t border-[#f0f1f7]">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8ca3] mb-3 flex items-center justify-between">
                        <span>Peer Contact Channels</span>
                        {isOwn && (
                          <button
                            onClick={() => setCurrentPage('profile-setup')}
                            className="text-[10px] text-[#6c5ce7] hover:underline font-bold"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {(targetProfile.fb_link || targetProfile.telegram_link || targetProfile.whatsapp_link) ? (
                        <div className="social-links-row flex flex-wrap gap-2.5">
                          {targetProfile.fb_link && (
                            <a 
                              href={formatSocialLink('facebook', targetProfile.fb_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="social-icon-3d social-fb flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs" 
                              title="Facebook Profile"
                              id="btn-social-fb"
                            >
                              <span className="font-black text-sm">f</span>
                              <span className="text-xs">Facebook</span>
                              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                            </a>
                          )}
                          {targetProfile.telegram_link && (
                            <a 
                              href={formatSocialLink('telegram', targetProfile.telegram_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="social-icon-3d social-tg flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs" 
                              title="Telegram Profile"
                              id="btn-social-tg"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-xs">Telegram</span>
                              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                            </a>
                          )}
                          {targetProfile.whatsapp_link && (
                            <a 
                              href={formatSocialLink('whatsapp', targetProfile.whatsapp_link)}
                              target="_blank"
                              rel="noreferrer"
                              className="social-icon-3d social-wa flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs" 
                              title="WhatsApp Contact"
                              id="btn-social-wa"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="text-xs">WhatsApp</span>
                              <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-center text-xs text-[#8a8ca3]">
                          No public contact links added yet.
                          {isOwn && (
                            <div className="mt-1.5">
                              <button
                                onClick={() => setCurrentPage('profile-setup')}
                                className="text-xs font-bold text-[#6c5ce7] hover:underline"
                              >
                                + Add Social Contacts
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Completed Skills */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="section-title" style={{ margin: 0 }}>
                      Completed skills ({targetCompletedSkills.length})
                    </div>
                  </div>
                  
                  {targetCompletedSkills.length > 0 ? (
                    <div className="space-y-3">
                      {targetCompletedSkills.map((cs) => {
                        const sk = skills.find(s => s.id === cs.skill_id) || { name: 'Skill Track', icon: '⚡', bg_color: '#6c5ce7', difficulty: 'Sprint' };
                        return (
                          <div 
                            key={cs.id} 
                            className="completed-skill-card profile-skill-3d-card group cursor-pointer hover:border-[#6c5ce7] transition-all"
                            onClick={() => {
                              setSelectedSkillId(cs.skill_id);
                              setCurrentPage('roadmap');
                            }}
                          >
                            <div className="icon skill-3d-badge" style={{ background: sk.bg_color || '#e84393' }}>
                              {sk.icon || '⚡'}
                            </div>
                            <div className="info min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-bold text-[#1a1c2e] group-hover:text-[#6c5ce7] transition-colors truncate">
                                  {sk.name}
                                </h5>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#f1eefe] text-[#6c5ce7] border border-[#6c5ce7]/20">
                                  +10 pts
                                </span>
                              </div>
                              <p className="text-xs text-[#8a8ca3] mt-0.5">Finished timed challenge curriculum on schedule</p>
                            </div>
                            <div className="time-badge 3d-badge-pill flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#00b894]" />
                              <span>Completed</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-profile-skills-card bg-white border border-[#e4e5ee] rounded-2xl p-8 text-center text-xs text-[#8a8ca3] shadow-xs">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6c5ce7] mx-auto flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#1a1c2e] mb-1">No Completed Challenges Yet</h4>
                      <p className="max-w-xs mx-auto text-xs text-[#8a8ca3] mb-4">
                        {isOwn 
                          ? "You haven't completed any timed challenges yet. Pick a skill track to start learning!" 
                          : "This student is currently working on their roadmap milestones."}
                      </p>
                      {isOwn && (
                        <button
                          onClick={() => setCurrentPage('discover')}
                          className="btn-challenge-cta px-4 py-2 text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                        >
                          <span>Explore Roadmaps</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* PAGE 9 — ADMIN PANEL */}
      {/* ========================================================================= */}
      {currentPage === 'admin' && (
        <div className="page" id="page-admin">
          <div className="page-tag">PAGE 9 — ADMIN PANEL</div>

          {!currentUser.is_admin ? (
            <div className="content py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1c2e] mb-2">Admin Access Restricted</h2>
              <p className="text-[#8a8ca3] text-sm max-w-md mx-auto mb-6">
                Only the designated system administrator (<span className="text-[#6c5ce7] font-semibold">{ADMIN_EMAIL}</span>) has permission to manage platform skills, tracks, and student accounts.
              </p>
              <button
                onClick={() => setCurrentPage('discover')}
                className="px-6 py-2.5 bg-[#6c5ce7] hover:opacity-90 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#6c5ce7]/20"
              >
                Return to Home
              </button>
            </div>
          ) : (
            <div className="content">
              
              <div className="admin-header-row flex items-center justify-between flex-wrap gap-3">
                <div className="section-title" style={{ margin: 0 }}>Admin dashboard</div>
                <div className="flex items-center gap-2">
                  <div 
                    className="admin-add-btn cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5 select-none"
                    onClick={() => {
                      setEditingSkill(null);
                      setIsSkillModalOpen(true);
                    }}
                    id="btn-admin-add-skill"
                  >
                    <Plus className="w-4 h-4" />
                    Add new skill
                  </div>
                </div>
              </div>

              {/* Real Admin Stats Grid */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#6c5ce7' }}>👥</div>
                  <div className="val">{adminStats.totalUsers}</div>
                  <div className="lbl">Total users</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#00b894' }}>⚡</div>
                  <div className="val">{adminStats.activeChallenges}</div>
                  <div className="lbl">Active challenges right now</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#e17055' }}>🔥</div>
                  <div className="val">{adminStats.mostPopularSkillName}</div>
                  <div className="lbl">Most popular skill</div>
                </div>
                <div className="admin-stat-card">
                  <div className="icon-wrap" style={{ background: '#fdcb6e' }}>🏆</div>
                  <div className="val">{adminStats.totalCompletions}</div>
                  <div className="lbl">Total completions</div>
                </div>
              </div>

              {/* Admin Tabs */}
              <div className="admin-tabs flex flex-wrap gap-2 mb-4">
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'users' ? 'active' : ''}`}
                  onClick={() => setAdminTab('users')}
                >
                  Users ({profiles.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'fields' ? 'active' : ''}`}
                  onClick={() => setAdminTab('fields')}
                >
                  Fields &amp; Categories ({fields.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'skills' ? 'active' : ''}`}
                  onClick={() => setAdminTab('skills')}
                >
                  Skill Tracks ({skills.length})
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none ${adminTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setAdminTab('steps')}
                >
                  Roadmaps &amp; Resources
                </div>
                <div 
                  className={`admin-tab cursor-pointer select-none flex items-center gap-1.5 ${adminTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => setAdminTab('feedback')}
                  id="admin-tab-feedback"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                </div>
              </div>

              {/* TAB: FIELDS / CATEGORIES */}
              {adminTab === 'fields' && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-[#1a1c2e]">Browse by Field Categories</div>
                    <button
                      onClick={() => {
                        setEditingField(null);
                        setIsFieldModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Field Category
                    </button>
                  </div>
                  {fields.length === 0 ? (
                    <div className="p-8 text-center bg-[#f8f9fc] rounded-xl border border-dashed border-[#e4e5ee] my-2">
                      <span className="text-3xl block mb-2">🧭</span>
                      <div className="text-sm font-bold text-[#1a1c2e]">No field categories available yet.</div>
                      <p className="text-xs text-[#8a8ca3] mt-1 mb-4">Add your first engineering field category to organize skill tracks.</p>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          setIsFieldModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Field
                      </button>
                    </div>
                  ) : (
                    <div className="admin-table">
                      <div className="admin-table-head">
                        <div>Field Category</div>
                        <div>Description</div>
                        <div>Icon</div>
                        <div>Actions</div>
                      </div>
                      {fields.map((f) => (
                        <div key={f.id} className="admin-table-row">
                          <div className="font-bold flex items-center gap-2">
                            <span className="text-lg">{f.icon || '💻'}</span>
                            {f.name}
                          </div>
                          <div className="text-xs text-[#8a8ca3] truncate max-w-xs">{f.description || 'No description'}</div>
                          <div>{f.icon || '💻'}</div>
                          <div>
                            <button 
                              className="admin-action-btn hover:bg-slate-100"
                              onClick={() => {
                                setEditingField(f);
                                setIsFieldModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="admin-action-btn danger hover:bg-red-50"
                              onClick={() => handleDeleteField(f.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: REAL USERS TABLE */}
              {adminTab === 'users' && (
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                  {/* Search Bar & Header */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <div className="text-sm font-bold text-[#1a1c2e] flex items-center gap-2">
                        <span>Registered Students &amp; Users</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100">
                          {adminUserSearch.trim() ? `${filteredAdminProfiles.length} of ${profiles.length}` : `${profiles.length} total`}
                        </span>
                      </div>
                      <p className="text-xs text-[#8a8ca3] mt-0.5">
                        Newest accounts appear at the top. Search instantly by name, email, or student roll.
                      </p>
                    </div>

                    {/* Search Input Box */}
                    <div className="w-full sm:w-80">
                      <div className="search-wrapper">
                        <span className="search-icon-inside">
                          <Search className="w-4 h-4" />
                        </span>
                        <input 
                          type="text"
                          value={adminUserSearch}
                          onChange={(e) => setAdminUserSearch(e.target.value)}
                          placeholder="Search by name, email, or roll..."
                          className="search-input-field !h-10.5 !text-sm"
                          style={{ paddingLeft: '44px', paddingRight: adminUserSearch ? '36px' : '16px' }}
                          id="admin-user-search-input"
                        />
                        {adminUserSearch && (
                          <button
                            type="button"
                            onClick={() => setAdminUserSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer z-10 transition-colors"
                            title="Clear search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {filteredAdminProfiles.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center my-2">
                      <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div className="text-sm font-bold text-slate-700">No matching users found</div>
                      <p className="text-xs text-slate-400 mt-1">
                        No user matched "{adminUserSearch}". You can search by partial name, full email address, or student roll number.
                      </p>
                      <button
                        onClick={() => setAdminUserSearch('')}
                        className="mt-3 px-3.5 py-1.5 bg-[#6c5ce7] hover:bg-[#5b4bc4] text-xs font-semibold text-white rounded-lg transition-colors shadow-xs"
                      >
                        Clear Search Filter
                      </button>
                    </div>
                  ) : (
                    <div className="admin-table">
                      <div className="admin-table-head">
                        <div>Name &amp; Email</div>
                        <div>Department</div>
                        <div>Batch</div>
                        <div>Points</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>

                      {filteredAdminProfiles.map((p) => {
                        const displayName = p.full_name?.trim() || (p.email ? p.email.split('@')[0] : (p.roll_number && p.roll_number !== 'N/A' ? `Student (${p.roll_number})` : 'Student'));
                        return (
                        <div key={p.id} className="admin-table-row">
                          <div className="flex flex-col">
                            <div className="font-bold flex items-center gap-2">
                              {displayName}
                              {p.is_admin && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                                  <Shield className="w-3 h-3" /> Admin
                                </span>
                              )}
                            </div>
                            {p.email ? (
                              <div className="text-[11px] text-[#8a8ca3] font-normal">{p.email}</div>
                            ) : p.roll_number && p.roll_number !== 'N/A' ? (
                              <div className="text-[11px] text-slate-500 font-normal">Roll: {p.roll_number}</div>
                            ) : (
                              <div className="text-[11px] text-slate-400 font-normal italic">Email syncing...</div>
                            )}
                            {(p.fb_link || p.whatsapp_link || p.telegram_link) && (
                              <div className="flex items-center gap-2 mt-1">
                                {p.fb_link && (
                                  <a href={p.fb_link.startsWith('http') ? p.fb_link : `https://${p.fb_link}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 text-[10px] flex items-center gap-0.5">
                                    FB ↗
                                  </a>
                                )}
                                {p.whatsapp_link && (
                                  <a href={p.whatsapp_link.startsWith('http') ? p.whatsapp_link : `https://wa.me/${p.whatsapp_link.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 text-[10px] flex items-center gap-0.5">
                                    WA ↗
                                  </a>
                                )}
                                {p.telegram_link && (
                                  <a href={p.telegram_link.startsWith('http') ? p.telegram_link : `https://t.me/${p.telegram_link.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-700 text-[10px] flex items-center gap-0.5">
                                    TG ↗
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <div>{p.department || 'N/A'}</div>
                            {p.roll_number && p.roll_number !== 'N/A' && (
                              <div className="text-[10px] text-slate-400">Roll: {p.roll_number}</div>
                            )}
                          </div>
                          <div>{p.batch_number || 'N/A'}</div>
                          <div className="font-bold">{p.points}</div>
                          <div>
                            <span className={`admin-badge-role ${p.is_banned ? 'bg-red-100 text-red-600' : ''}`}>
                              {p.is_banned ? 'Banned' : 'Active'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              className="admin-action-btn hover:bg-slate-100"
                              onClick={() => handleOpenUserProfile(p.id)}
                            >
                              View
                            </button>
                            {p.is_admin || p.id === currentUser?.id || (p.email || '').toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() ? (
                              <span className="text-[11px] text-[#8a8ca3] font-medium italic px-2 py-1 select-none">
                                Protected
                              </span>
                            ) : (
                              <button 
                                className="admin-action-btn danger hover:bg-red-50"
                                onClick={() => handleBanToggle(p.id)}
                              >
                                {p.is_banned ? 'Unban' : 'Ban'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  )}
                </div>
              )}

            {/* TAB 2: SKILL TRACKS */}
            {adminTab === 'skills' && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold text-[#1a1c2e]">Global Skill Tracks</div>
                    <div className="text-xs text-[#8a8ca3]">Centrally synchronized in Supabase database</div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSkill(null);
                      setIsSkillModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Skill Track
                  </button>
                </div>

                {skills.length === 0 ? (
                  <div className="p-8 text-center bg-[#f8f9fc] rounded-xl border border-dashed border-[#e4e5ee] my-2">
                    <span className="text-3xl block mb-2">⚡</span>
                    <div className="text-sm font-bold text-[#1a1c2e]">No skills available yet.</div>
                    <p className="text-xs text-[#8a8ca3] mt-1 mb-4">Add your first skill track to populate the Supabase database.</p>
                    <button
                      onClick={() => {
                        setEditingSkill(null);
                        setIsSkillModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#6c5ce7] text-white text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Skill
                    </button>
                  </div>
                ) : (
                  <div className="admin-table">
                    <div className="admin-table-head">
                      <div>Skill Track</div>
                      <div>Parent Field</div>
                      <div>Difficulty</div>
                      <div>Avg Duration</div>
                      <div>Steps Count</div>
                      <div>Actions</div>
                    </div>

                    {skills.map((s) => {
                      const parentField = fields.find(f => f.id === s.field_id);
                      const stepsCount = roadmapSteps[s.id]?.length || 3;
                      return (
                        <div key={s.id} className="admin-table-row">
                          <div className="font-bold flex items-center gap-2">
                            <span 
                              className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs"
                              style={{ background: s.bg_color || '#6c5ce7' }}
                            >
                              {s.icon}
                            </span>
                            {s.name}
                          </div>
                          <div>{parentField?.name || 'General'}</div>
                          <div>{s.difficulty || 'Beginner'}</div>
                          <div>{s.avg_days || '3 days'}</div>
                          <div className="font-bold">{stepsCount} steps</div>
                          <div>
                            <button 
                              className="admin-action-btn hover:bg-slate-100"
                              onClick={() => {
                                setEditingSkill(s);
                                setIsSkillModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="admin-action-btn danger hover:bg-red-50"
                              onClick={() => handleDeleteSkill(s.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ROADMAP STEPS & RESOURCES */}
            {adminTab === 'steps' && (
              <AdminRoadmapSection
                skills={skills}
                fields={fields}
                selectedSkillId={selectedSkillId}
                onSelectSkillId={(id) => setSelectedSkillId(id)}
                roadmapSteps={roadmapSteps}
                skillResources={skillResources}
                onOpenAddStep={() => setIsStepModalOpen(true)}
                onOpenAddResource={() => setIsResourceModalOpen(true)}
                onDeleteStep={handleDeleteStep}
                onDeleteResource={handleDeleteResource}
              />
            )}

            {/* TAB: FEEDBACK */}
            {adminTab === 'feedback' && (
              <AdminFeedbackSection 
                profiles={profiles}
                onOpenUserProfile={(userId) => {
                  setSelectedUserId(userId);
                  setCurrentPage('profile');
                }}
                showToast={showToast}
              />
            )}

            </div>
          )}
        </div>
      )}

      {/* Main Website Footer */}
      {currentUser && currentUser.id && currentPage !== 'login' && currentPage !== 'signup' && (
        <Footer 
          currentUser={currentUser}
          onNavigate={(page) => {
            if (page === 'discover') {
              setDiscoverView('main');
              setSelectedFieldId(null);
            }
            if (page === 'profile') {
              setSelectedUserId(currentUser.id);
            }
            setCurrentPage(page);
          }}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {/* Deadline Picker Modal */}
      <DeadlineModal
        skill={currentSkill}
        isOpen={isDeadlineModalOpen}
        onClose={() => setIsDeadlineModalOpen(false)}
        onConfirm={handleStartSkill}
      />

      {/* Add Extra Time Modal */}
      {activeProgress && (
        <AddTimeModal
          isOpen={isAddTimeModalOpen}
          onClose={() => setIsAddTimeModalOpen(false)}
          onConfirm={handleAddExtraTime}
          currentDeadline={activeProgress.deadline_at}
          skillName={skills.find(s => s.id === activeProgress.skill_id)?.name || 'Active Skill'}
        />
      )}

      {/* Cancel Challenge Confirmation Modal */}
      {activeProgress && (
        <CancelChallengeModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelChallenge}
          skillName={skills.find(s => s.id === activeProgress.skill_id)?.name || 'Skill'}
        />
      )}

      {/* Admin Skill Add/Edit Modal */}
      <SkillModal 
        isOpen={isSkillModalOpen}
        onClose={() => {
          setIsSkillModalOpen(false);
          setEditingSkill(null);
        }}
        onSave={handleSaveSkill}
        fields={fields}
        initialData={editingSkill}
      />

      {/* Admin Field Add/Edit Modal */}
      <FieldModal 
        isOpen={isFieldModalOpen}
        onClose={() => {
          setIsFieldModalOpen(false);
          setEditingField(null);
        }}
        onSave={handleSaveField}
        initialData={editingField}
      />

      {/* Admin Step Add Modal */}
      <StepModal 
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        onSave={handleAddStep}
        skillId={currentSkill.id}
        skillName={currentSkill.name}
        nextOrder={currentSkillSteps.length + 1}
      />

      {/* Admin Resource / Document / Reference Add Modal */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSave={handleAddResource}
        skillId={currentSkill.id}
        skillName={currentSkill.name}
      />

      {/* Supabase SQL Code Schema Modal */}
      <SqlCodeModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Password Recovery Modal */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryMode}
        onClose={() => setIsPasswordRecoveryMode(false)}
        onSaveNewPassword={handleSaveNewPassword}
        newPassword={newRecoveryPassword}
        setNewPassword={setNewRecoveryPassword}
        confirmPassword={confirmRecoveryPassword}
        setConfirmPassword={setConfirmRecoveryPassword}
        isLoading={isUpdatingPassword}
        onPasteRecoveryLink={handlePasteRecoveryLink}
      />

      {/* Send Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* User Feedback History Modal */}
      {currentUser && currentUser.id && (
        <UserFeedbackHistoryModal
          isOpen={isMyFeedbackModalOpen}
          onClose={() => setIsMyFeedbackModalOpen(false)}
          userId={currentUser.id}
          onOpenSendFeedback={() => setIsFeedbackModalOpen(true)}
        />
      )}

      {/* Admin Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirmState.onConfirm}
        title={deleteConfirmState.title}
        itemTitle={deleteConfirmState.itemTitle}
        message={deleteConfirmState.message}
        confirmLabel={deleteConfirmState.confirmLabel}
      />

    </div>
  );
}
