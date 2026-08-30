import React, { useState, useEffect } from 'react';
import { FeedbackItem } from '../types';
import { getUserFeedback } from '../lib/supabaseService';
import { X, MessageSquare, Plus, Clock, RefreshCw } from 'lucide-react';

interface UserFeedbackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onOpenSendFeedback: () => void;
}

export const UserFeedbackHistoryModal: React.FC<UserFeedbackHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  onOpenSendFeedback
}) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyFeedback = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserFeedback(userId);
      setFeedbackList(data);
    } catch (err) {
      console.error('[UserFeedbackHistoryModal] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchMyFeedback();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in"
      id="modal-user-feedback-history-overlay"
    >
      <div 
        className="bg-white dark:bg-[#141726] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#23273e] relative text-slate-900 dark:text-white animate-scale-up max-h-[85vh] flex flex-col"
        id="modal-user-feedback-history-content"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181c30] hover:bg-slate-200 dark:hover:bg-[#1e223d] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#6c5ce7]/10 text-[#6c5ce7] dark:text-[#a29bfe] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Feedback History
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          View your submitted suggestions and inquiries.
        </p>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-[#23273e]">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Total Submitted: {feedbackList.length}
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSendFeedback();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#6c5ce7] hover:bg-[#5b4bc4] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Send New Feedback
          </button>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#6c5ce7]" />
              <span>Loading your feedback...</span>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-[#23273e] rounded-xl">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No feedback submitted yet</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Have an idea or spotted a bug? Share your thoughts to help us improve.
              </p>
            </div>
          ) : (
            feedbackList.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#181c30] border border-slate-200 dark:border-[#262b47] hover:border-slate-300 dark:hover:border-[#383e60] transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'unread' 
                      ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30' 
                      : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                  }`}>
                    {item.status === 'unread' ? 'Submitted' : 'Reviewed'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-200 dark:border-[#23273e] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#181c30] hover:bg-slate-200 dark:hover:bg-[#1e223d] text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-[#262b47]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
