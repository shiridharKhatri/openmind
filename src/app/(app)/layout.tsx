'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { Menu } from 'lucide-react';
import { applyThemeSettings } from '@/lib/theme';
import { ConversationsProvider } from '@/providers/ConversationsProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'personalization' | 'theme' | 'data'>('general');

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load theme settings on mount
  useEffect(() => {
    applyThemeSettings();
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        // Focus search — handled by sidebar
      }
      if (isMod && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Extract conversation ID from pathname
  useEffect(() => {
    const match = pathname.match(/\/chat\/(.+)/);
    if (match) {
      setActiveConversationId(match[1]);
    } else if (pathname === '/chat') {
      setActiveConversationId(null);
    }
  }, [pathname]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    router.push('/chat');
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    router.push(`/chat/${id}`);
  };

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-surface)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-lavender-400 flex items-center justify-center animate-pulse">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="text-[var(--text-muted)] text-[14px]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <ConversationsProvider>
      <div className="h-screen w-full flex overflow-hidden bg-[var(--bg-surface)]">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onOpenSettings={(tab) => {
              if (tab) setSettingsTab(tab);
              setSettingsOpen(true);
            }}
          />
        )}

        {/* Mobile Drawer */}
        {isMobile && mobileDrawerOpen && (
          <Sidebar
            isOpen={true}
            onToggle={() => setMobileDrawerOpen(false)}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            isMobile
            onCloseMobile={() => setMobileDrawerOpen(false)}
            onOpenSettings={(tab) => {
              if (tab) setSettingsTab(tab);
              setSettingsOpen(true);
            }}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header bar */}
          {isMobile && (
            <div className="flex items-center px-3 h-12 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          )}

          {/* Header */}
          {pathname.startsWith('/chat') && (
            <Header
              sidebarOpen={sidebarOpen}
            />
          )}

          {/* Page content */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {children}
          </main>
        </div>

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          defaultTab={settingsTab}
        />
      </div>
    </ConversationsProvider>
  );
}
