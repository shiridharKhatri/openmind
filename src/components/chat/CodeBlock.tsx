'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = language && hljs.getLanguage(language)
    ? hljs.highlight(value, { language }).value
    : hljs.highlightAuto(value).value;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-[var(--border-color)] my-3 notranslate" translate="no">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-hover)] border-b border-[var(--border-color)]">
        <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="!m-0 !rounded-none overflow-x-auto">
        <code
          className={`hljs language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
