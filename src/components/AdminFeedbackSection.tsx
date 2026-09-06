import React, { useState, useEffect, useMemo } from 'react';
import { FeedbackItem, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { getAllFeedback, markFeedbackAsRead } from '../lib/supabaseService';
import { MessageSquare, Mail, User, Clock, CheckCircle, Eye, AlertCircle, RefreshCw, X, Filter } from 'lucide-react';

interface AdminFeedbackSectionProps {
  profiles: Profile[];
  onOpenUserProfile?: (userId: string) => void;
  showToast: (msg: string) => void;
}

export const AdminFeedbackSection: React.FC<AdminFeedbackSectionProps> = ({
  profiles,
  onOpenUserProfile,
  showToast
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch initial feedback
  const fetchFeedbackData = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedback();
      setFeedbackList(data);
    } catch (err) {
      console.error('[AdminFeedbackSection] Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();

    // Setup Supabase Realtime subscription on public.feedback
    const channel = supabase
      .channel('admin-feedback-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback'
        },
        (payload) => {
          console.log('[Supabase Realtime Feedback Change]:', payload);
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as FeedbackItem;
            setFeedbackList((prev) => {
              // Avoid duplicate if already present
              if (prev.some((item) => item.id === newItem.id)) return prev;
              return [newItem, ...prev];
            });
            showToast(`📨 New feedback received from ${newItem.user_email || 'a student'}`);
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as FeedbackItem;
            setFeedbackList((prev) =>
              prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
            );
            setSelectedFeedback((prev) =>
              prev && prev.id === updatedItem.id ? { ...prev, ...updatedItem } : prev
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as any)?.id;
            if (oldId) {
              setFeedbackList((prev) => prev.filter((item) => item.id !== oldId));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Supabase Realtime Feedback Channel Status]:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute metrics
  const totalCount = feedbackList.length;
  const unreadCount = useMemo(
    () => feedbackList.filter((f) => f.status === 'unread').length,
    [feedbackList]
  );
  const readCount = totalCount - unreadCount;

  // Filtered list
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      if (filterStatus === 'unread' && f.status !== 'unread') return false;
      if (filterStatus === 'read' && f.status !== 'read') return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const userProf = profiles.find((p) => p.id === f.user_id);
        const nameMatch = userProf?.full_name?.toLowerCase().includes(term);
        const emailMatch = f.user_email?.toLowerCase().includes(term);
        const msgMatch = f.message?.toLowerCase().includes(term);
        return nameMatch || emailMatch || msgMatch;
      }
      return true;
    });
  }, [feedbackList, filterStatus, searchTerm, profiles]);

  // Open feedback modal & auto-mark as read if unread
  const handleOpenFeedback = async (item: FeedbackItem) => {
    setSelectedFeedback(item);

    if (item.status === 'unread') {
      // Optimistic update locally
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'read' } : f))
      );
      setSelectedFeedback((prev) => (prev ? { ...prev, status: 'read' } : null));

      // Persist to Supabase
      const res = await markFeedbackAsRead(item.id);
      if (!res.success) {
        console.error('[markFeedbackAsRead failed]:', res.error);
      }
    }
  };

  const getProfileName = (userId: string, email: string) => {
    const prof = profiles.find((p) => p.id === userId);
    if (prof && prof.full_name) return prof.full_name;
    if (email) return email.split('@')[0];
    return 'Anonymous Student';
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white dark:bg-[#141726] rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-[#23273e]" id="admin-feedback-section">
      {/* Header & Metric Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-[#23273e]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-[#1a1c2e] dark:text-white tracking-tight">
              User Feedback
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#101321] text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-[#23273e]">
              Realtime Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Read and review suggestions, bug reports, and feedback submitted by DIU students.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-[#101321] border border-slate-200 dark:border-[#23273e] rounded-xl">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{totalCount}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 rounded-xl">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Unread:</span>
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{unreadCount}</span>
          </div>
          <button
            onClick={fetchFeedbackData}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#23273e] hover:bg-slate-50 dark:hover:bg-[#1f2338] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh Feedback"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#101321] rounded-xl w-full sm:w-auto border border-slate-200 dark:border-[#23273e]">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-[#1e2238] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#2b304c]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'unread'
                ? 'bg-[#6c5ce7] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterStatus('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'read'
                ? 'bg-white dark:bg-[#1e2238] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-[#2b304c]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by user or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#101321] text-slate-900 dark:text-white border border-slate-300 dark:border-[#23273e] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]/20 focus:border-[#6c5ce7] transition-all"
          />
        </div>
      </div>

      {/* Feedback Table */}
      {loading && feedbackList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6c5ce7]" />
          Loading feedback entries from Supabase...
        </div>
      ) : filteredFeedback.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-[#23273e] rounded-2xl bg-slate-50/50 dark:bg-[#101321]">
          <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-200">No feedback found</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
            {searchTerm || filterStatus !== 'all'
              ? 'No feedback matches the selected filters.'
              : 'Students have not submitted any feedback yet.'}
          </p>
        </div>
      ) : (
        <div className="admin-table overflow-hidden">
          <div className="admin-table-head grid grid-cols-12 gap-2">
            <div className="col-span-3">User</div>
            <div className="col-span-5">Message</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {filteredFeedback.map((item) => {
            const userName = getProfileName(item.user_id, item.user_email);
            const isUnread = item.status === 'unread';

            return (
              <div
                key={item.id}
                onClick={() => handleOpenFeedback(item)}
                className={`admin-table-row grid grid-cols-12 gap-2 items-center cursor-pointer transition-colors ${
                  isUnread ? 'bg-purple-50/40 dark:bg-purple-950/20 font-medium hover:bg-purple-50/70 dark:hover:bg-purple-950/40' : 'hover:bg-slate-50 dark:hover:bg-[#181c2e]'
                }`}
                title="Click to view full feedback message"
              >
                {/* User Column */}
                <div className="col-span-3 flex flex-col min-w-0 pr-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                    {userName}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                    {item.user_email}
                  </span>
                </div>

                {/* Message Column */}
                <div className="col-span-5 min-w-0 pr-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Date Column */}
                <div className="col-span-2 text-xs text-slate-400 dark:text-slate-400 whitespace-nowrap">
                  {formatDate(item.created_at)}
                </div>

                {/* Status Badge */}
                <div className="col-span-1">
                  {isUnread ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                      Unread
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1a1e30] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#23273e]">
                      Read
                    </span>
                  )}
                </div>

                {/* Action Column */}
                <div className="col-span-1 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFeedback(item);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-[#282e4b] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors inline-flex"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Feedback Detail Modal */}
      {selectedFeedback && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          id="modal-view-feedback-overlay"
        >
          <div 
            className="bg-white dark:bg-[#141726] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#23273e] relative text-[#1a1c2e] dark:text-white animate-scale-up"
            id="modal-view-feedback-content"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e2238] hover:bg-slate-200 dark:hover:bg-[#2b304c] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-[#6c5ce7]/10 dark:bg-[#6c5ce7]/20 text-[#6c5ce7] dark:text-purple-300 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-[#1a1c2e] dark:text-white tracking-tight">
                  Feedback Details
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ID: <span className="font-mono">{selectedFeedback.id}</span>
                </span>
              </div>
            </div>

            {/* Info Table / Grid */}
            <div className="bg-slate-50 dark:bg-[#101321] rounded-xl p-4 mb-5 space-y-3 border border-slate-200 dark:border-[#23273e] text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">User:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right truncate">
                  {getProfileName(selectedFeedback.user_id, selectedFeedback.user_email)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium text-right truncate">
                  {selectedFeedback.user_email}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Submitted:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium text-right">
                  {formatDate(selectedFeedback.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">Status:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                  READ
                </span>
              </div>
            </div>

            {/* Full Message */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Message
              </label>
              <div className="p-4 rounded-xl bg-white dark:bg-[#101321] border border-slate-300 dark:border-[#23273e] text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-normal shadow-xs">
                {selectedFeedback.message}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-[#23273e]">
              {onOpenUserProfile && selectedFeedback.user_id ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenUserProfile(selectedFeedback.user_id);
                    setSelectedFeedback(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#6c5ce7] dark:text-purple-300 hover:bg-[#6c5ce7]/10 dark:hover:bg-[#6c5ce7]/20 transition-colors flex items-center gap-1.5 cursor-pointer border border-[#6c5ce7]/30 dark:border-purple-500/30"
                >
                  <User className="w-3.5 h-3.5" />
                  View User Profile
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                className="px-6 py-2.5 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
