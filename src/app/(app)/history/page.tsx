'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Clock,
  Trash2,
  Pin,
  Archive,
  Pencil,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';
import { cn, truncate, formatDate } from '@/lib/utils';

interface HistoryConversation {
  _id: string;
  title: string;
  model: string;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<HistoryConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (showArchived) params.set('archived', 'true');
      params.set('limit', '100');

      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showArchived]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'delete') {
        await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        setConversations((prev) => prev.filter((c) => c._id !== id));
      } else if (action === 'pin') {
        const convo = conversations.find((c) => c._id === id);
        await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinned: !convo?.pinned }),
        });
        fetchConversations();
      } else if (action === 'archive') {
        await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true }),
        });
        setConversations((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Action failed:', err);
    }
    setContextMenuId(null);
  };

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      fetchConversations();
    }
    setEditingId(null);
    setEditTitle('');
  };

  // Group by date
  const grouped: Record<string, HistoryConversation[]> = {};
  for (const convo of conversations) {
    const label = formatDate(convo.updatedAt || convo.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(convo);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-1">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              History
            </h1>
          </div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Browse and manage your conversation history
          </p>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] border transition-colors',
              showArchived
                ? 'border-lavender-400 bg-lavender-50 text-lavender-600 dark:bg-lavender-900/20 dark:text-lavender-400'
                : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
            )}
          >
            <Archive size={14} />
            <span>Archived</span>
          </button>
          {conversations.length > 0 && (
            <button
              onClick={async () => {
                if (confirm('Delete ALL conversations? This cannot be undone.')) {
                  await fetch('/api/conversations', { method: 'DELETE' });
                  setConversations([]);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] border border-red-300 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete All</span>
            </button>
          )}
        </div>

        {/* Conversations list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-[var(--bg-hover)] animate-pulse" />
            ))}
          </div>
        ) : Object.keys(grouped).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(grouped).map(([label, convos]) => (
              <div key={label}>
                <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                  {label}
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {convos.map((convo) => (
                    <div key={convo._id} className="relative group rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-lavender-400/30 hover:bg-[var(--bg-hover)] transition-all duration-200 shadow-sm overflow-hidden">
                      {editingId === convo._id ? (
                        <div className="p-3 bg-[var(--bg-input)]">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleRename(convo._id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(convo._id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="w-full px-3 py-2 text-[13px] rounded-lg border border-lavender-400 bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-4 py-3">
                          <button
                            onClick={() => router.push(`/chat/${convo._id}`)}
                            className="flex-1 text-left flex items-center gap-3 min-w-0"
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              convo.pinned ? "bg-lavender-100 text-lavender-500 dark:bg-lavender-900/30" : "bg-[var(--bg-hover)] text-[var(--text-muted)]"
                            )}>
                              <MessageSquare size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13.5px] font-medium text-[var(--text-primary)] truncate flex items-center gap-1.5">
                                {convo.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
                                  {convo.model}
                                </span>
                              </div>
                            </div>
                          </button>

                          {/* Quick Hover Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pl-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(convo._id, 'pin'); }}
                              className={cn(
                                "p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-lavender-400 transition-colors",
                                convo.pinned && "text-lavender-400"
                              )}
                              title={convo.pinned ? "Unpin conversation" : "Pin conversation"}
                            >
                              <Pin size={13} className={convo.pinned ? "fill-current" : ""} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingId(convo._id); setEditTitle(convo.title); }}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              title="Rename conversation"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(convo._id, 'archive'); }}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              title="Archive conversation"
                            >
                              <Archive size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(convo._id, 'delete'); }}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                              title="Delete conversation"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1">
              No conversations yet
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Start a new chat to see your history here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
