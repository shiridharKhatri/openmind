'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Plus,
  Search,
  Compass,
  BookOpen,
  FolderOpen,
  Clock,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Pin,
  Archive,
  User,
  Settings,
  Palette,
  LogOut,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronsUpDown,
  FileText,
  CheckSquare,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react';
import { cn, truncate, formatDate } from '@/lib/utils';
import { useConversations } from '@/lib/hooks/useConversations';
import { IConversation } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSettings?: (tab?: 'general' | 'personalization' | 'theme' | 'data') => void;
}

const navItems = [
  { icon: Compass, label: 'Explore', href: '/explore' },
  { icon: FileText, label: 'Resume Builder', href: '/resume' },
  { icon: CheckSquare, label: 'ATS Scorer', href: '/ats' },
  { icon: Mail, label: 'Cover Letter', href: '/cover-letter' },
  { icon: MessageSquare, label: 'Interview Prep', href: '/interview' },
  { icon: Send, label: 'Cold Outreach', href: '/outreach' },
  { icon: Sparkles, label: 'Humanizer', href: '/humanizer' },
  { icon: BookOpen, label: 'Library', href: '/library' },
  { icon: FolderOpen, label: 'Files', href: '/files' },
  { icon: Clock, label: 'History', href: '/history' },
];

export function Sidebar({
  isOpen,
  onToggle,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isMobile = false,
  onCloseMobile,
  onOpenSettings,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { conversations, fetchConversations, deleteConversation, updateConversation } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu-trigger') && !target.closest('.context-menu-box')) {
        setContextMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeConversationId, fetchConversations]);

  const groupedConversations = groupConversations(conversations);

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await updateConversation(id, { title: editTitle.trim() });
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleNav = (href: string) => {
    router.push(href);
    onCloseMobile?.();
  };

  const showCollapseButton = !isOpen && !isMobile;

  return (
    <>
      {/* Floating Open button with smooth fade-in */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-3 left-3 z-30 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all duration-300 shadow-sm",
          showCollapseButton ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
        aria-label="Open sidebar"
      >
        <PanelLeft size={18} />
      </button>

      {/* Mobile overlay */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/35 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'flex flex-col h-full bg-[var(--bg-sidebar)] transition-all duration-300 ease-in-out overflow-hidden',
          isMobile
            ? cn(
                'fixed top-0 left-0 z-50 w-[280px] shadow-xl transform',
                isOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : cn(
                isOpen ? 'w-[280px] border-r border-[var(--border-color)]' : 'w-0 border-r-0'
              )
        )}
      >
        {/* Top — Logo + collapse */}
        <div className="flex items-center justify-between px-4 h-14 bg-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center overflow-hidden">
              <img
                src="/omlogo.png"
                alt="OpenMind Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-[15px] text-[var(--text-primary)]">
              OpenMind
            </span>
          </div>
          <button
            onClick={isMobile ? onCloseMobile : onToggle}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label={isMobile ? 'Close sidebar' : 'Collapse sidebar'}
          >
            {isMobile ? <X size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-lavender-400 text-white text-[13.5px] font-medium hover:bg-lavender-500 transition-colors shadow-sm"
            aria-label="New chat"
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400/50 transition-colors"
              aria-label="Search conversations"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-2 py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors',
                  isActive
                    ? 'bg-lavender-50 text-lavender-600 font-medium dark:bg-lavender-900/20 dark:text-lavender-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                )}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {Object.entries(groupedConversations).map(([label, convos]) => (
            <div key={label} className="mb-3">
              <div className="px-3 py-1.5 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {label}
              </div>
              {convos.map((convo) => (
                <div key={convo._id} className="relative group">
                  {editingId === convo._id ? (
                    <div className="px-3 py-1.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleRename(convo._id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(convo._id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="w-full px-2 py-1 text-[13px] rounded border border-lavender-400 bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectConversation(convo._id);
                        onCloseMobile?.();
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center',
                        activeConversationId === convo._id
                          ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                      )}
                    >
                      <span className="truncate flex-1">
                        {convo.pinned && (
                          <Pin size={10} className="inline mr-1 text-lavender-400" />
                        )}
                        {truncate(convo.title, 35)}
                      </span>

                      {/* Context menu trigger */}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuId(
                            contextMenuId === convo._id ? null : convo._id
                          );
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--border-color)] transition-opacity context-menu-trigger"
                      >
                        <MoreHorizontal size={14} />
                      </span>
                    </button>
                  )}

                  {/* Context menu */}
                  <div
                    className={cn(
                      "absolute right-2 top-8 z-50 w-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 text-[13px] transition-all duration-200 ease-out origin-top-right context-menu-box",
                      contextMenuId === convo._id
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    )}
                  >
                      <button
                        onClick={() => {
                          setEditingId(convo._id);
                          setEditTitle(convo.title);
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      >
                        <Pencil size={13} />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={async () => {
                          await updateConversation(convo._id, {
                            pinned: !convo.pinned,
                          } as Partial<IConversation>);
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      >
                        <Pin size={13} />
                        <span>{convo.pinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                      <button
                        onClick={async () => {
                          await updateConversation(convo._id, {
                            archived: true,
                          } as Partial<IConversation>);
                          setContextMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                      >
                        <Archive size={13} />
                        <span>Archive</span>
                      </button>
                      <div className="border-t border-[var(--border-color)] my-1" />
                      <button
                        onClick={async () => {
                          const isDeletingActive = activeConversationId === convo._id;
                          await deleteConversation(convo._id);
                          setContextMenuId(null);
                          if (isDeletingActive) {
                            onNewChat();
                          }
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* User profile */}
        <div className="relative z-20 border-t border-[var(--border-color)]/30 p-3 bg-gradient-to-b from-transparent to-[var(--bg-sidebar)]/90" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg-card)]/80 dark:bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border-color)]/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all duration-200"
          >
            {/* Premium Dynamic Accent Gradient Ring Avatar */}
            <div className="relative flex items-center justify-center p-[2px] rounded-full bg-gradient-to-tr from-lavender-500 to-lavender-600 shadow-sm shrink-0">
              <div className="w-7 h-7 rounded-full bg-[var(--bg-card)] dark:bg-[var(--bg-sidebar)] flex items-center justify-center text-lavender-600 dark:text-lavender-400 text-[12px] font-bold tracking-wider">
                {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[13px] font-bold text-[var(--text-primary)] tracking-wide truncate">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-[10.5px] text-[var(--text-muted)] tracking-normal truncate">
                {session?.user?.email || ''}
              </div>
            </div>
            <ChevronsUpDown size={14} className="text-[var(--text-muted)] shrink-0 transition-transform duration-200" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'none' }} />
          </button>

          {/* User menu */}
          <div
            className={cn(
              "absolute bottom-full left-3 right-3 mb-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50 transition-all duration-200 ease-out origin-bottom overflow-hidden",
              showUserMenu
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 translate-y-2 pointer-events-none"
            )}
          >
            <div className="px-2 py-1.5">
              <button
                onClick={() => {
                  router.push('/upgrade');
                  setShowUserMenu(false);
                  onCloseMobile?.();
                }}
                className="w-full text-left px-3 py-2 flex items-center justify-between rounded-lg bg-gradient-to-r from-lavender-500 to-lavender-600 dark:from-lavender-600 dark:to-lavender-750 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white animate-pulse" />
                  <span className="text-[12.5px] font-semibold tracking-wide">Upgrade to Pro</span>
                </div>
              </button>
            </div>
            <div className="border-t border-[var(--border-color)] my-1" />
            <button
              onClick={() => {
                onOpenSettings?.('general');
                setShowUserMenu(false);
                onCloseMobile?.();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <User size={14} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings?.('personalization');
                setShowUserMenu(false);
                onCloseMobile?.();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <SlidersHorizontal size={14} />
              <span>Personalize</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings?.('general');
                setShowUserMenu(false);
                onCloseMobile?.();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                onOpenSettings?.('theme');
                setShowUserMenu(false);
                onCloseMobile?.();
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            >
              <Palette size={14} />
              <span>Theme</span>
            </button>
            <div className="border-t border-[var(--border-color)] my-1" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Group conversations by date
function groupConversations(
  conversations: IConversation[]
): Record<string, IConversation[]> {
  const groups: Record<string, IConversation[]> = {};

  for (const convo of conversations) {
    const label = formatDate(convo.updatedAt || convo.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(convo);
  }

  return groups;
}
