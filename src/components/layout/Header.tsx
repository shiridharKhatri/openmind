'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  MoreHorizontal,
  Link2,
  Download,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  sidebarOpen?: boolean;
}

export function Header({ selectedModel, onModelChange, sidebarOpen = true }: HeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const displayName = selectedModel?.split(':')[0] || 'OpenMind';
  const isChatPage = pathname.startsWith('/chat');

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-transparent">
      {/* Left — Branding */}
      <div className={`flex items-center gap-2 px-1 transition-opacity duration-200 ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
          <img
            src="/omlogo.png"
            alt="OpenMind Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-[14px] font-medium text-[var(--text-primary)]">
          OpenMind
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        {isChatPage && (
          <>
            {/* More menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={18} />
              </button>

              {showMoreMenu && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50">
                  <button className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                    <Link2 size={14} />
                    <span>Share conversation</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">
                    <Download size={14} />
                    <span>Export chat</span>
                  </button>
                </div>
              )}
            </div>

            {/* Share */}
            <button
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Share"
            >
              <Link2 size={18} />
            </button>

            {/* Export */}
            <button
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Export chat"
            >
              <Download size={14} />
              <span>Export chat</span>
            </button>
          </>
        )}

        {/* Upgrade */}
        <button
          onClick={() => window.location.href = '/upgrade'}
          className="ml-1 px-4 py-1.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-card)] text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Upgrade
        </button>
      </div>
    </header>
  );
}
