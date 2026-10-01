import React from 'react';
import { LoginRequiredModal, LoginRequiredModalProps } from './LoginRequiredModal';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  badge?: string;
  onLogin: () => void;
  onSignUp: () => void;
  continueText?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Login Required',
  message,
  onLogin,
  onSignUp
}) => {
  return (
    <LoginRequiredModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={onLogin}
      onSignUp={onSignUp}
      title={title}
      description={message || 'Please log in to your Pragati account to access this feature.'}
      secondaryDescription="Your progress, learning activity, and personalized features are available after you sign in."
    />
  );
};

export default AuthModal;
