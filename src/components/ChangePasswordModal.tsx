import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Check, X, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
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

  const minLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);

    try {
      // Direct update for currently authenticated user without requiring old password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      onSuccessToast('Password updated successfully!');
      setTimeout(() => {
        setNewPassword('');
        setConfirmPassword('');
        setSuccess(false);
        onClose();
      }, 1200);
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      id="change-password-modal-overlay"
      onClick={handleModalClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="change-password-modal-card"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6c5ce7] via-[#3b82f6] to-[#00b894]" />

        {/* Close Button */}
        <button 
          onClick={handleModalClose}
          disabled={loading}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close modal"
          id="change-password-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6c5ce7] flex items-center justify-center shadow-inner shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Change Password
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Set a new secure password for <span className="text-indigo-600 font-bold">{userEmail || 'your account'}</span>
            </p>
          </div>
        </div>

        {/* Security Note Banner */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-blue-800">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            No old password is required because you are securely logged in. You can toggle the eye icon to verify your new password before saving.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Password successfully updated! Closing...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                disabled={loading || success}
                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                required
                minLength={6}
                id="input-new-password"
              />
              <button 
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                disabled={loading || success}
                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                required
                minLength={6}
                id="input-confirm-new-password"
              />
              <button 
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Live Validation Badges */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                minLength ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Check className="w-3 h-3" />
              </div>
              <span className={minLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                Minimum 6 characters
              </span>
            </div>

            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordsMatch ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button 
              type="button"
              onClick={handleModalClose}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !minLength || !passwordsMatch || success}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                loading || !minLength || !passwordsMatch || success
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
                  : 'bg-gradient-to-r from-[#6c5ce7] to-[#3b82f6] hover:from-[#5b4bc4] hover:to-[#2563eb] shadow-indigo-500/25 active:scale-98'
              }`}
              id="submit-update-password-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Updated!</span>
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
