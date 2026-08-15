import { Bell, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  rightContent?: ReactNode;
}

export function PageHeader({ title, subtitle, children, rightContent }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-cero-border bg-cero-bg/80 backdrop-blur-md z-10 sticky top-0">
      <div className="flex-1">
        {children ? children : (
          <>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-cero-text-muted mt-1">{subtitle}</p>}
          </>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        {rightContent}
        <div className="flex items-center gap-4 border-l border-cero-border pl-6">
          <button className="text-cero-text-muted hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <button className="text-cero-text-muted hover:text-white transition-colors">
            <HelpCircle size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-cero-lime hidden md:block">Admin</span>
            <img src="https://i.pravatar.cc/150?u=admin" alt="Profile" className="w-8 h-8 rounded-full border border-cero-border" />
          </div>
        </div>
      </div>
    </header>
  );
}
