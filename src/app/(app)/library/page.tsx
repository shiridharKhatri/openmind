'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  FolderPlus,
  Trash2,
  Tag,
  BookOpen,
  FileText,
  MessageSquare,
  Lightbulb,
  Beaker,
  Filter,
  SortDesc,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibraryItem {
  _id: string;
  title: string;
  content: string;
  type: 'prompt' | 'response' | 'research' | 'document' | 'conversation';
  folder?: string;
  tags?: string[];
  createdAt: string;
}

const typeIcons = {
  prompt: Lightbulb,
  response: MessageSquare,
  research: Beaker,
  document: FileText,
  conversation: MessageSquare,
};

const typeColors = {
  prompt: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  response: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  research: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  document: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  conversation: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
};

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', content: '', type: 'prompt' });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterType !== 'all') params.set('type', filterType);

      const res = await fetch(`/api/library?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch library items:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateItem = async () => {
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setShowNewItemModal(false);
        setNewItem({ title: '', content: '', type: 'prompt' });
        fetchItems();
      }
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/library/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="mb-1">
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                Library
              </h1>
            </div>
            <p className="text-[14px] text-[var(--text-secondary)]">
              Save and organize your prompts, responses, and research
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <FolderPlus size={14} />
              <span>New folder</span>
            </button>
            <button
              onClick={() => setShowNewItemModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] bg-lavender-400 text-white hover:bg-lavender-500 transition-colors"
            >
              <Plus size={14} />
              <span>Save item</span>
            </button>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
              <SortDesc size={16} />
            </button>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2 mb-6">
          {['all', 'prompt', 'response', 'research', 'document'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors capitalize',
                filterType === type
                  ? 'bg-lavender-400 text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-[var(--bg-hover)] animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const Icon = typeIcons[item.type] || FileText;
              const colorClass = typeColors[item.type] || typeColors.document;

              return (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-lavender-300/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                      <Icon size={14} />
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag size={10} className="text-[var(--text-muted)]" />
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen size={40} className="mx-auto mb-3 text-[var(--text-muted)]" />
            <h3 className="text-[15px] font-medium text-[var(--text-primary)] mb-1">
              Your library is empty
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Save prompts, responses, and research to access them later
            </p>
          </div>
        )}

        {/* New item modal */}
        {showNewItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-[480px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-xl p-6 mx-4">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] mb-4">
                Save to library
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400"
                />
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  placeholder="Content"
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 resize-none"
                />
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400"
                >
                  <option value="prompt">Prompt</option>
                  <option value="response">Response</option>
                  <option value="research">Research</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setShowNewItemModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateItem}
                  disabled={!newItem.title || !newItem.content}
                  className="px-4 py-2 rounded-xl text-[13px] bg-lavender-400 text-white hover:bg-lavender-500 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
