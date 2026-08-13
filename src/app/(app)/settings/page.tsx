'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import {
  Settings,
  User,
  Palette,
  Brain,
  Sliders,
  Bell,
  Shield,
  Database,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  Check,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'models', label: 'AI Models', icon: Brain },
  { id: 'preferences', label: 'AI Preferences', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('account');
  const [defaultModel, setDefaultModel] = useState('openmind:latest');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemInstructions, setSystemInstructions] = useState('');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <Settings size={20} className="text-lavender-400" />
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              Settings
            </h1>
          </div>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex gap-8">
          {/* Section nav */}
          <nav className="hidden md:block w-48 flex-shrink-0">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2.5 transition-colors mb-0.5',
                  activeSection === section.id
                    ? 'bg-lavender-50 text-lavender-600 font-medium dark:bg-lavender-900/20 dark:text-lavender-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
                )}
              >
                <section.icon size={15} />
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Account */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                    Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-lavender-100 dark:bg-lavender-900/30 flex items-center justify-center text-lavender-600 dark:text-lavender-400 text-lg font-semibold">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-[15px] font-medium text-[var(--text-primary)]">
                          {session?.user?.name || 'User'}
                        </div>
                        <div className="text-[13px] text-[var(--text-secondary)]">
                          {session?.user?.email || ''}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                        Display name
                      </label>
                      <input
                        type="text"
                        defaultValue={session?.user?.name || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={session?.user?.email || ''}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-hover)] text-[14px] text-[var(--text-muted)] cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                  Theme
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn(
                        'p-4 rounded-xl border text-center transition-all',
                        theme === t.id
                          ? 'border-lavender-400 bg-lavender-50 dark:bg-lavender-900/20'
                          : 'border-[var(--border-color)] hover:border-lavender-300/50',
                      )}
                    >
                      <t.icon
                        size={20}
                        className={cn(
                          'mx-auto mb-2',
                          theme === t.id ? 'text-lavender-500' : 'text-[var(--text-muted)]',
                        )}
                      />
                      <div className="text-[13px] font-medium text-[var(--text-primary)]">
                        {t.label}
                      </div>
                      {theme === t.id && (
                        <Check size={14} className="text-lavender-500 mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Models */}
            {activeSection === 'models' && (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                  Default model
                </h2>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400"
                >
                  <option value="qwen3">Qwen 3</option>
                  <option value="llama3.2">Llama 3.2</option>
                  <option value="mistral">Mistral</option>
                </select>
                <p className="text-[12px] text-[var(--text-muted)] mt-2">
                  Models are served by your local Ollama instance
                </p>
              </div>
            )}

            {/* AI Preferences */}
            {activeSection === 'preferences' && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                    AI parameters
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[13px] font-medium text-[var(--text-secondary)]">
                          Temperature
                        </label>
                        <span className="text-[13px] text-[var(--text-muted)]">
                          {temperature}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-lavender-400"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                        Max tokens
                      </label>
                      <input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                    System instructions
                  </h2>
                  <textarea
                    value={systemInstructions}
                    onChange={(e) => setSystemInstructions(e.target.value)}
                    placeholder="Custom instructions for the AI..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-lavender-400 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                  Notifications
                </h2>
                <label className="flex items-center justify-between">
                  <span className="text-[14px] text-[var(--text-primary)]">
                    Enable notifications
                  </span>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={cn(
                      'w-10 h-6 rounded-full transition-colors relative',
                      notifications ? 'bg-lavender-400' : 'bg-[var(--border-color)]',
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                        notifications ? 'translate-x-5' : 'translate-x-1',
                      )}
                    />
                  </button>
                </label>
              </div>
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                    Privacy
                  </h2>
                  <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                    All your data is processed locally through Ollama. No data is sent to external servers.
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-red-200 dark:border-red-800 bg-[var(--bg-card)]">
                  <h2 className="text-[15px] font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Danger zone
                  </h2>
                  <div className="space-y-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                      <Trash2 size={14} />
                      Clear all conversations
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                      <Download size={14} />
                      Export all data
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={14} />
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data */}
            {activeSection === 'data' && (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-4">
                  Data management
                </h2>
                <div className="space-y-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors w-full justify-start">
                    <Download size={14} />
                    Export conversations
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors w-full justify-start">
                    <Download size={14} />
                    Export library items
                  </button>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeSection === 'billing' && (
              <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-2">
                  Current plan
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-lavender-100 text-lavender-600 dark:bg-lavender-900/30 dark:text-lavender-400">
                    Free
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                  You are currently on the free plan. Upgrade to unlock premium features.
                </p>
                <button
                  onClick={() => window.location.href = '/upgrade'}
                  className="px-4 py-2 rounded-xl text-[13px] bg-lavender-400 text-white hover:bg-lavender-500 transition-colors"
                >
                  View plans
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
