'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Sliders,
  User,
  Heart,
  Palette,
  Trash2,
  Check,
  Sparkles,
  Cpu,
  Download,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { applyThemeSettings } from '@/lib/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: TabType;
}

type TabType = 'general' | 'personalization' | 'theme' | 'data' | 'stats';

export function SettingsModal({ isOpen, onClose, defaultTab }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personalization');
  const { setTheme: setNextTheme } = useTheme();

  // Sync activeTab when modal opens with a specific defaultTab
  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);
  const modalRef = useRef<HTMLDivElement>(null);

  // General States
  const [language, setLanguage] = useState('English');
  const [enterToSend, setEnterToSend] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [autoScroll, setAutoScroll] = useState(true);
  const [tokenStats, setTokenStats] = useState<{
    summary: { prompt: number; completion: number; total: number };
    daily: { date: string; label: string; prompt: number; completion: number; total: number }[];
  } | null>(null);
  const [storageStats, setStorageStats] = useState<{ conversations: number; messages: number; storageSize: string } | null>(null);

  // Personalization States
  const [customInstructions, setCustomInstructions] = useState('');
  const [nickname, setNickname] = useState('');
  const [occupation, setOccupation] = useState('');
  const [moreAboutYou, setMoreAboutYou] = useState('');
  const [selectedPet, setSelectedPet] = useState('None');
  const [isMemoryEnabled, setIsMemoryEnabled] = useState(true);

  // Theme States
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('lavender');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [chatDensity, setChatDensity] = useState('comfortable');
  const [codeTheme, setCodeTheme] = useState('One Dark');

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomInstructions(localStorage.getItem('om_custom_instructions') || '');
      setNickname(localStorage.getItem('om_nickname') || '');
      setOccupation(localStorage.getItem('om_occupation') || '');
      setMoreAboutYou(localStorage.getItem('om_more_about_you') || '');
      setSelectedPet(localStorage.getItem('om_selected_pet') || 'None');
      setTheme(localStorage.getItem('theme') || 'dark');
      setLanguage(localStorage.getItem('om_language') || 'English');
      setEnterToSend(localStorage.getItem('om_enter_to_send') !== 'false');
      setShowTimestamps(localStorage.getItem('om_show_timestamps') === 'true');
      setFontSize(localStorage.getItem('om_font_size') || 'medium');
      setAutoScroll(localStorage.getItem('om_auto_scroll') !== 'false');
      setAccentColor(localStorage.getItem('om_accent_color') || 'lavender');
      setFontFamily(localStorage.getItem('om_font_family') || 'Inter');
      setChatDensity(localStorage.getItem('om_chat_density') || 'comfortable');
      setCodeTheme(localStorage.getItem('om_code_theme') || 'One Dark');
      const memory = localStorage.getItem('om_memory_enabled');
      setIsMemoryEnabled(memory !== 'false');
    }
  }, [isOpen]);

  // Load stats when modal opens
  useEffect(() => {
    if (isOpen) {
      fetch('/api/stats')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setTokenStats(data);
          }
        })
        .catch((err) => console.error('Failed to load token stats:', err));

      fetch('/api/stats/db')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setStorageStats(data);
          }
        })
        .catch((err) => console.error('Failed to load storage stats:', err));
    }
  }, [isOpen]);

  // Save helper
  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const handleClearChats = () => {
    if (confirm('Are you sure you want to clear all chat histories? This action is irreversible.')) {
      fetch('/api/conversations', { method: 'DELETE' }).then(() => {
        window.location.reload();
      });
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/conversations/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `openmind_chat_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to compile chat export file.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('An error occurred during data compilation.');
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sidebarItems = [
    { id: 'general' as TabType, label: 'General', icon: Settings },
    { id: 'personalization' as TabType, label: 'Personalization', icon: Sliders },
    { id: 'theme' as TabType, label: 'Theme & Style', icon: Palette },
    { id: 'stats' as TabType, label: 'Usage Stats', icon: Cpu },
    { id: 'data' as TabType, label: 'Data controls', icon: Trash2 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-205">
      <div
        ref={modalRef}
        className="w-full max-w-3xl h-[560px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-row animate-in zoom-in-95 duration-300 origin-center"
      >
        {/* Sidebar Navigation */}
        <div className="w-[220px] bg-[var(--bg-surface)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2.5 py-2 mb-4">
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">Settings</span>
            </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 text-left',
                    activeTab === item.id
                      ? 'bg-lavender-100 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-[var(--border-color)] text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Done
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-card)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] capitalize">
              {activeTab === 'theme' ? 'Theme & Style' : activeTab === 'stats' ? 'Usage Statistics' : activeTab}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 prompt-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-5">
                {/* Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Language</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      saveSetting('om_language', e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] focus:border-lavender-500 outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Español</option>
                    <option value="French">Français</option>
                    <option value="German">Deutsch</option>
                    <option value="Chinese">中文</option>
                    <option value="Japanese">日本語</option>
                    <option value="Korean">한국어</option>
                    <option value="Hindi">हिन्दी</option>
                    <option value="Nepali">नेपाली</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Font size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setFontSize(size);
                          saveSetting('om_font_size', size);
                        }}
                        className={cn(
                          'p-2.5 rounded-xl border text-[12px] font-medium capitalize transition-all',
                          fontSize === size
                            ? 'border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20 text-lavender-600 dark:text-lavender-400'
                            : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enter to Send */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">Enter to send</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Press Enter to send messages. Use Shift+Enter for new lines.</span>
                  </div>
                  <button
                    onClick={() => {
                      setEnterToSend(!enterToSend);
                      saveSetting('om_enter_to_send', (!enterToSend).toString());
                    }}
                    className={cn(
                      'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0',
                      enterToSend ? 'bg-lavender-500' : 'bg-zinc-600'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-full bg-white transition-transform duration-200', enterToSend ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>

                {/* Show Timestamps */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">Show timestamps</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Display time next to each message in conversations.</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowTimestamps(!showTimestamps);
                      saveSetting('om_show_timestamps', (!showTimestamps).toString());
                    }}
                    className={cn(
                      'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0',
                      showTimestamps ? 'bg-lavender-500' : 'bg-zinc-600'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-full bg-white transition-transform duration-200', showTimestamps ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>

                {/* Auto-scroll */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">Auto-scroll</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Automatically scroll to the latest message during streaming.</span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoScroll(!autoScroll);
                      saveSetting('om_auto_scroll', (!autoScroll).toString());
                    }}
                    className={cn(
                      'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none shrink-0',
                      autoScroll ? 'bg-lavender-500' : 'bg-zinc-600'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-full bg-white transition-transform duration-200', autoScroll ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (() => {
              const promptTokens = tokenStats?.summary?.prompt || 0;
              const completionTokens = tokenStats?.summary?.completion || 0;
              const totalTokens = tokenStats?.summary?.total || 1;
              const promptPercent = Math.max(1, Math.min(99, Math.round((promptTokens / totalTokens) * 100))) || 50;
              const completionPercent = 100 - promptPercent;

              const maxDailyTokens = tokenStats?.daily && tokenStats.daily.length > 0
                ? Math.max(...tokenStats.daily.map(d => d.total), 1)
                : 1;

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Unified Hero Dashboard Card */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)]/70 to-[var(--bg-surface)]/30 border border-[var(--border-color)]/30 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    {/* Glowing background blob */}
                    <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-[var(--accent,#9b7de8)]/8 blur-3xl pointer-events-none" />
                    
                    {/* Header */}
                    <div className="flex flex-col gap-1 z-10 relative">
                      <span className="text-[10px] font-bold text-[var(--accent,#9b7de8)] uppercase tracking-[0.15em]">System Compute</span>
                      <h4 className="text-[18px] font-bold text-[var(--text-primary)]">Token usage ledger</h4>
                    </div>

                    {/* Total Tokens Large Presentation */}
                    <div className="mt-6 flex flex-col gap-1 z-10 relative">
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">Accumulated Tokens</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--accent,#9b7de8)] via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                          {tokenStats?.summary ? tokenStats.summary.total.toLocaleString() : '0'}
                        </span>
                        <span className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">tokens</span>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[var(--border-color)]/20 my-4" />

                    {/* Two-Column Stat Row (No harsh borders, clean typography) */}
                    <div className="grid grid-cols-2 gap-8 z-10 relative">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                          <span className="text-[11.5px] text-[var(--text-muted)] font-medium">Prompt (Input)</span>
                        </div>
                        <span className="text-xl font-bold text-[var(--text-primary)] pl-4">
                          {tokenStats?.summary ? tokenStats.summary.prompt.toLocaleString() : '0'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent,#9b7de8)] shadow-[0_0_8px_rgba(155,125,232,0.5)]" />
                          <span className="text-[11.5px] text-[var(--text-muted)] font-medium">Completion (Output)</span>
                        </div>
                        <span className="text-xl font-bold text-[var(--text-primary)] pl-4">
                          {tokenStats?.summary ? tokenStats.summary.completion.toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Graphical Visualizations Container (Side-by-side, no boxy cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Ring Distribution Card */}
                    <div className="md:col-span-2 p-5 rounded-3xl bg-[var(--bg-card)]/40 border border-[var(--border-color)]/20 shadow-sm flex flex-col items-center justify-center gap-4">
                      <span className="text-[11.5px] font-bold text-[var(--text-secondary)] self-start pl-1 tracking-wide">Usage ratio</span>
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                          {/* Background ring */}
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" strokeWidth="2.5" opacity="0.15" />
                          {/* Prompt Segment */}
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" 
                            stroke="#818cf8" strokeWidth="3" 
                            strokeDasharray={`${promptPercent} ${100 - promptPercent}`} 
                            strokeDashoffset="0" 
                            strokeLinecap="round"
                          />
                          {/* Completion Segment */}
                          <circle 
                            cx="18" cy="18" r="15.915" fill="none" 
                            stroke="var(--accent,#9b7de8)" strokeWidth="3" 
                            strokeDasharray={`${completionPercent} ${100 - completionPercent}`} 
                            strokeDashoffset={-promptPercent} 
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Centered Readout */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-[11px] font-bold text-[var(--text-primary)] leading-none gap-0.5">
                          <span className="text-[13px] font-black">{completionPercent}%</span>
                          <span className="text-[6.5px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Output</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full text-[11px] border-t border-[var(--border-color)]/10 pt-3">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span>Input</span>
                          </span>
                          <span className="font-semibold text-[var(--text-primary)]">{promptPercent}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--accent,#9b7de8)]" />
                            <span>Output</span>
                          </span>
                          <span className="font-semibold text-[var(--text-primary)]">{completionPercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Activity Bar Chart */}
                    <div className="md:col-span-3 p-5 rounded-3xl bg-[var(--bg-card)]/40 border border-[var(--border-color)]/20 shadow-sm flex flex-col gap-5">
                      <span className="text-[11.5px] font-bold text-[var(--text-secondary)] tracking-wide">Last 7 days activity</span>
                      <div className="flex items-end justify-between h-32 pt-2 px-1 relative">
                        {tokenStats?.daily && tokenStats.daily.length > 0 ? (
                          tokenStats.daily.map((day) => {
                            const heightPercent = (day.total / maxDailyTokens) * 100;
                            return (
                              <div key={day.date} className="flex flex-col items-center gap-2.5 group cursor-pointer flex-1">
                                <div className="relative w-full flex items-end justify-center h-24">
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-white text-[9px] px-2 py-0.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30 font-medium">
                                    {day.total.toLocaleString()} tokens
                                  </div>
                                  {/* Capsule Bar */}
                                  <div 
                                    className="w-2 sm:w-3.5 bg-gradient-to-t from-[var(--accent,#9b7de8)] to-indigo-400 rounded-full group-hover:opacity-85 hover:shadow-[0_0_12px_rgba(155,125,232,0.4)] transition-all duration-300"
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-[var(--text-muted)] font-semibold">{day.label}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[var(--text-muted)]">
                            No recent activity data.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'personalization' && (
              <div className="space-y-5">
                {/* Custom Instructions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[var(--text-primary)]">Custom instructions</label>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Provide instructions on how you want the AI to behave, respond, or format its replies.
                  </p>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => {
                      setCustomInstructions(e.target.value);
                      saveSetting('om_custom_instructions', e.target.value);
                    }}
                    placeholder="e.g. 'Keep answers concise', 'Always include code comments in typescript', 'Prefer friendly and enthusiastic tone'..."
                    className="w-full h-24 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 resize-none outline-none focus:border-lavender-400"
                  />
                </div>

                {/* Nickname & Occupation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[var(--text-primary)]">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => {
                        setNickname(e.target.value);
                        saveSetting('om_nickname', e.target.value);
                      }}
                      placeholder="What should AI call you?"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:border-lavender-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-[var(--text-primary)]">Occupation</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => {
                        setOccupation(e.target.value);
                        saveSetting('om_occupation', e.target.value);
                      }}
                      placeholder="e.g. Developer, Student, Writer"
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:border-lavender-400"
                    />
                  </div>
                </div>

                {/* More About You */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-[var(--text-primary)]">About you</label>
                  <input
                    type="text"
                    value={moreAboutYou}
                    onChange={(e) => {
                      setMoreAboutYou(e.target.value);
                      saveSetting('om_more_about_you', e.target.value);
                    }}
                    placeholder="Interests, values, or preferences to keep in mind"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 outline-none focus:border-lavender-400"
                  />
                </div>

                {/* Enable Memory Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">Enable memory</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Let OpenMind remember details from past chats to personalize replies.</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMemoryEnabled(!isMemoryEnabled);
                      saveSetting('om_memory_enabled', (!isMemoryEnabled).toString());
                    }}
                    className={cn(
                      'w-10 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none',
                      isMemoryEnabled ? 'bg-lavender-500' : 'bg-zinc-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full bg-white transition-transform duration-200',
                        isMemoryEnabled ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* Pet Companion selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Heart size={13} className="text-red-400" />
                    <span>Pet Companion</span>
                  </label>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Choose a virtual companion that works alongside you and responds to your chat mood.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['None', '🐱 Cat', '🐶 Dog', '🐉 Dragon'].map((pet) => (
                      <button
                        key={pet}
                        onClick={() => {
                          setSelectedPet(pet);
                          saveSetting('om_selected_pet', pet);
                        }}
                        className={cn(
                          'p-2.5 rounded-xl border text-[12px] font-medium text-center transition-all',
                          selectedPet === pet
                            ? 'border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20 text-lavender-600 dark:text-lavender-400'
                            : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        )}
                      >
                        {pet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Theme Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Appearance</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['light', 'dark', 'system'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          saveSetting('theme', t);
                          setNextTheme(t);
                          applyThemeSettings();
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-[12.5px] font-semibold capitalize transition-all',
                          theme === t
                            ? 'border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20 text-lavender-600 dark:text-lavender-400'
                            : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Accent color</label>
                  <p className="text-[11px] text-[var(--text-muted)]">Choose the primary accent color used throughout the interface.</p>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { name: 'lavender', color: 'bg-lavender-500' },
                      { name: 'blue', color: 'bg-blue-500' },
                      { name: 'green', color: 'bg-emerald-500' },
                      { name: 'rose', color: 'bg-rose-500' },
                      { name: 'amber', color: 'bg-amber-500' },
                      { name: 'cyan', color: 'bg-cyan-500' },
                    ].map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setAccentColor(c.name);
                          saveSetting('om_accent_color', c.name);
                          applyThemeSettings();
                        }}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center',
                          c.color,
                          accentColor === c.name
                            ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-card)] ring-[var(--text-primary)] scale-110'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        )}
                        aria-label={c.name}
                      >
                        {accentColor === c.name && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      saveSetting('om_font_family', e.target.value);
                      applyThemeSettings();
                    }}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] focus:border-lavender-500 outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="System">System Default</option>
                  </select>
                </div>

                {/* Chat Density */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Chat density</label>
                  <p className="text-[11px] text-[var(--text-muted)]">Adjust the spacing between messages.</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['compact', 'comfortable', 'spacious'].map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          setChatDensity(d);
                          saveSetting('om_chat_density', d);
                          applyThemeSettings();
                        }}
                        className={cn(
                          'p-2.5 rounded-xl border text-[12px] font-medium capitalize transition-all',
                          chatDensity === d
                            ? 'border-lavender-500 bg-lavender-50 dark:bg-lavender-900/20 text-lavender-600 dark:text-lavender-400'
                            : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Block Theme */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-semibold text-[var(--text-primary)]">Code block theme</label>
                  <select
                    value={codeTheme}
                    onChange={(e) => {
                      setCodeTheme(e.target.value);
                      saveSetting('om_code_theme', e.target.value);
                      applyThemeSettings();
                    }}
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] focus:border-lavender-500 outline-none"
                  >
                    <option value="One Dark">One Dark</option>
                    <option value="GitHub Dark">GitHub Dark</option>
                    <option value="Dracula">Dracula</option>
                    <option value="Monokai">Monokai</option>
                    <option value="Nord">Nord</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Storage Info Card */}
                <div className="flex flex-col gap-3.5 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-lavender-500/10 text-lavender-600 dark:text-lavender-400">
                      <Database size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-[var(--text-primary)]">Local Storage Summary</span>
                      <span className="text-[11px] text-[var(--text-muted)]">Database footprint of your conversations and models.</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/50">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Chats</span>
                      <span className="text-[14px] font-bold text-[var(--text-primary)] mt-1 block">
                        {storageStats ? storageStats.conversations : '0'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/50">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Messages Sent</span>
                      <span className="text-[14px] font-bold text-[var(--text-primary)] mt-1 block">
                        {storageStats ? storageStats.messages : '0'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/50">
                      <span className="text-[10px] text-[var(--text-muted)] block font-semibold">DB Disk footprint</span>
                      <span className="text-[14px] font-bold text-[var(--text-primary)] mt-1 block">
                        {storageStats ? storageStats.storageSize : '0 MB'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Export Data Control */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-bold text-[var(--text-primary)]">Export chat history</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Download a copy of your conversations and logs as a JSON file.</span>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[12px] font-semibold text-[var(--text-primary)] transition-all active:scale-[0.98]"
                  >
                    <Download size={14} />
                    <span>Export JSON</span>
                  </button>
                </div>

                {/* Delete/Clear chats Control */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-bold text-red-500">Delete all chat history</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Wipe out all saved conversations. This action cannot be undone.</span>
                  </div>
                  <button
                    onClick={handleClearChats}
                    className="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold transition-all active:scale-[0.98]"
                  >
                    Clear chats
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
