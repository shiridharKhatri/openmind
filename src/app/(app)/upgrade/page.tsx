'use client';

import { Check, MessageSquare, Zap, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Get started with local AI',
    icon: MessageSquare,
    highlighted: false,
    features: [
      'Unlimited local AI chats',
      'Ollama model support',
      'File uploads (10MB)',
      'Conversation history',
      'Library (50 items)',
      'Light & dark mode',
    ],
    cta: 'Current plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    period: '/month',
    description: 'For power users and professionals',
    icon: Zap,
    highlighted: true,
    features: [
      'Everything in Free',
      'Cloud AI providers (OpenAI, Anthropic)',
      'Priority model access',
      'File uploads (100MB)',
      'Unlimited library',
      'Deep Research mode',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    period: '/user/month',
    description: 'For teams and organizations',
    icon: Building2,
    highlighted: false,
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Admin dashboard',
      'SSO/SAML',
      'Custom models',
      'API access',
      'SLA guarantee',
      'Dedicated support',
      'On-premise option',
    ],
    cta: 'Contact sales',
    disabled: false,
  },
];

export default function UpgradePage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Choose your plan
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)]">
            Unlock the full potential of OpenMind
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg',
                plan.highlighted
                  ? 'border-lavender-400 bg-[var(--bg-card)] shadow-md shadow-lavender-200/10 dark:shadow-lavender-900/10'
                  : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--accent)]',
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-lavender-400 text-white text-[11px] font-medium shadow-sm">
                  Most popular
                </div>
              )}

              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-105',
                plan.id === 'pro'
                  ? 'bg-lavender-500 text-white'
                  : plan.id === 'enterprise'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
              )}>
                <plan.icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
              </div>

              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {plan.name}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-[var(--text-primary)]">
                  ${plan.price}
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">
                  {plan.period}
                </span>
              </div>

              <button
                disabled={plan.disabled}
                className={cn(
                  'w-full py-2.5 rounded-xl text-[13.5px] font-medium transition-colors mb-6',
                  plan.highlighted
                    ? 'bg-lavender-400 text-white hover:bg-lavender-500'
                    : plan.disabled
                      ? 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-default'
                      : 'border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]',
                )}
              >
                {plan.cta}
              </button>

              <div className="space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className={cn(
                        'mt-0.5 flex-shrink-0',
                        plan.highlighted ? 'text-lavender-500' : 'text-[var(--text-muted)]',
                      )}
                    />
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
