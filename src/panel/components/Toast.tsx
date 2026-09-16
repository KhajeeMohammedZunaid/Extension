import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, show }) => {
  return (
    <div className={`p-toast ${show ? 'show' : ''}`} id="prism-toast">
      <span className="p-toast-icon">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <span className="p-toast-msg">{message || 'Copied to clipboard!'}</span>
    </div>
  );
};
