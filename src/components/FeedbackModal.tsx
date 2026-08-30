import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { submitFeedback } from '../lib/supabaseService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const MAX_CHARS = 1000;
  const charsRemaining = MAX_CHARS - message.length;
  const isTooLong = charsRemaining < 0;
  const isEmpty = message.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isTooLong || loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await submitFeedback(message);
      if (!result.success) {
        setError(result.error || 'Failed to send feedback. Please try again.');
        setLoading(false);
        return;
      }

      setMessage('');
      setLoading(false);
      onClose();
      onSuccess('Thank you! Your feedback has been sent successfully.');
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in"
      id="modal-send-feedback-overlay"
    >
      <div 
        className="bg-white dark:bg-[#141726] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#23273e] relative text-slate-900 dark:text-white animate-scale-up"
        id="modal-send-feedback-content"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181c30] hover:bg-slate-200 dark:hover:bg-[#1e223d] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          title="Close"
          id="btn-close-feedback-modal"
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
              Send Feedback
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
          Help us improve DIU CSE Skill Tracker by sharing your thoughts.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback here..."
              rows={5}
              maxLength={MAX_CHARS + 50}
              disabled={loading}
              className={`w-full p-4 rounded-xl border ${
                isTooLong 
                  ? 'border-red-400 focus:ring-red-300' 
                  : 'border-slate-300 dark:border-[#2a2f4c] focus:border-[#6c5ce7] focus:ring-[#6c5ce7]/20'
              } text-sm bg-slate-50 dark:bg-[#101320] focus:bg-white dark:focus:bg-[#151829] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 resize-none transition-all`}
              autoFocus
              id="textarea-feedback-message"
            />
          </div>

          {/* Character counter */}
          <div className="flex items-center justify-between text-xs mb-6">
            <span className="text-slate-500 dark:text-slate-400">
              Maximum 1000 characters
            </span>
            <span className={`font-mono font-medium ${isTooLong ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
              {message.length} / {MAX_CHARS}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#23273e]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-[#262b47] hover:bg-slate-50 dark:hover:bg-[#181c30] text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
              id="btn-cancel-feedback"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEmpty || isTooLong || loading}
              className="px-6 py-2.5 rounded-xl bg-[#6c5ce7] hover:bg-[#5b4bc4] disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              id="btn-submit-feedback"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
