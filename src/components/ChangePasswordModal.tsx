import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onSuccessToast: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSuccessToast
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      onSuccessToast('Password changed successfully!');
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (loading) return;
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  const isFormValid = newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs"
      id="modal-change-password-overlay"
      onClick={handleModalClose}
    >
      <div 
        className="bg-white dark:bg-[#141726] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#23273e] relative text-slate-800 dark:text-white"
        onClick={(e) => e.stopPropagation()}
        id="modal-change-password-content"
      >
        {/* Close Button */}
        <button 
          onClick={handleModalClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181c30] hover:bg-slate-200 dark:hover:bg-[#1e223d] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          title="Close"
          id="btn-close-password-modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6c5ce7] dark:text-[#a29bfe] flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/40">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Change Password
            </h2>
            {userEmail && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[240px]">
                {userEmail}
              </p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                disabled={loading || success}
                className="w-full h-11 px-3.5 pr-10 bg-slate-50 dark:bg-[#101320] focus:bg-white dark:focus:bg-[#151829] border border-slate-300 dark:border-[#2a2f4c] focus:border-[#6c5ce7] rounded-xl text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#6c5ce7]/15"
                required
                minLength={6}
                id="input-new-password"
              />
              <button 
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                disabled={loading || success}
                className="w-full h-11 px-3.5 pr-10 bg-slate-50 dark:bg-[#101320] focus:bg-white dark:focus:bg-[#151829] border border-slate-300 dark:border-[#2a2f4c] focus:border-[#6c5ce7] rounded-xl text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#6c5ce7]/15"
                required
                minLength={6}
                id="input-confirm-new-password"
              />
              <button 
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Live mismatch hint */}
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={handleModalClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#262b47] hover:bg-slate-100 dark:hover:bg-[#181c30] text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !isFormValid || success}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                loading || !isFormValid || success
                  ? 'bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed text-slate-500 dark:text-slate-600'
                  : 'bg-[#6c5ce7] hover:bg-[#5b4bc4] shadow-purple-500/20 active:scale-95'
              }`}
              id="btn-submit-change-password"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
