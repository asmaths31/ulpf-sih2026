import React from 'react';

export function GlassCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`backdrop-blur-[20px] bg-glass border border-[var(--glass-border)] rounded-card shadow-glass p-6 ${className}`}>
      {children}
    </div>
  );
}

export function StatBadge({ type, text }: { type: 'success' | 'danger' | 'warning', text: string }) {
  const styles = {
    success: 'bg-success-bg text-success',
    danger: 'bg-danger-bg text-danger',
    warning: 'bg-warning-bg text-warning',
  };
  return (
    <span className={`px-2 py-0.5 rounded-pill text-xs font-medium ${styles[type]}`}>
      {text}
    </span>
  );
}

export function PrimaryButton({ children, onClick, className = '' }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`bg-primary hover:bg-primary-deep text-white font-medium py-3 px-6 rounded-pill transition-all duration-180 ease-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}
