'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  MoreHorizontal,
  Link2,
  Download,
  Sparkles,
  ChevronDown,
  Brain,
} from 'lucide-react';
import { useModels } from '@/lib/hooks/useModels';
import { useConversationsContext } from '@/providers/ConversationsProvider';

interface HeaderProps {
  sidebarOpen?: boolean;
}

export function Header({ sidebarOpen = true }: HeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { selectedModel, setSelectedModel } = useConversationsContext();
  const { models: fetchedModels } = useModels();

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
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
      
      {/* Center — Model Selector */}
      {isChatPage && (
        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setShowModelDropdown(!showModelDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all shadow-sm"
          >
            <Brain size={14} className="text-lavender-400" />
            <span className="capitalize">{selectedModel.split(':')[0]}</span>
            <ChevronDown size={14} className={`opacity-60 transition-transform duration-200 ${showModelDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showModelDropdown && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-muted)] border-b border-[var(--border-color)] mb-1">
                Select AI Model
              </div>
              <div className="max-h-60 overflow-y-auto prompt-scrollbar">
                {fetchedModels.map((m) => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 text-[13px] transition-colors hover:bg-[var(--bg-hover)] ${
                        isSelected ? 'bg-lavender-50/50 dark:bg-lavender-900/10 text-lavender-500 dark:text-lavender-400 font-medium' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{m.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">{m.description}</span>
                    </button>
                  );
                })}
                {fetchedModels.length === 0 && (
                  <div className="px-3 py-2 text-[12px] text-[var(--text-muted)] italic">
                    No models found. Make sure Ollama is running.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
