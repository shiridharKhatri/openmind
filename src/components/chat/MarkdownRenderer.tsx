'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import ImageLoader from '../ui/ImageLoader';

interface MarkdownRendererProps {
  content: string;
}

export function LinkPreview({ href }: { href?: string }) {
  const [preview, setPreview] = useState<{ title: string; description: string; image: string; url: string } | null>(null);

  useEffect(() => {
    if (!href) return;
    if (!href.startsWith('http://') && !href.startsWith('https://')) return;

    // 1. Generate fallback details immediately
    let hostname = '';
    let fallbackTitle = '';
    try {
      const urlObj = new URL(href);
      hostname = urlObj.hostname;
      const cleanDomain = hostname.replace('www.', '');
      const domainName = cleanDomain.split('.')[0];
      fallbackTitle = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    } catch {
      hostname = href;
      fallbackTitle = href;
    }

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    setPreview({
      title: fallbackTitle,
      description: `Visit ${hostname} to view this site.`,
      image: faviconUrl,
      url: href,
    });

    // 2. Fetch rich preview data
    fetch(`/api/preview?url=${encodeURIComponent(href)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setPreview({
            title: data.title && data.title.trim() ? data.title : fallbackTitle,
            description: data.description && data.description.trim() ? data.description : `Visit ${hostname} to view this site.`,
            image: data.image && data.image.trim() ? data.image : faviconUrl,
            url: href,
          });
        }
      })
      .catch(() => {});
  }, [href]);

  if (!preview) return null;

  let hostname = '';
  try {
    hostname = href ? new URL(href).hostname : '';
  } catch {
    // fallback
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--bg-hover)]/30 hover:bg-[var(--bg-hover)]/50 transition-all duration-300 no-underline text-inherit group max-w-lg"
    >
      {preview.image && (
        <div className="w-16 sm:w-20 h-16 sm:h-20 relative shrink-0 overflow-hidden bg-black/5 flex items-center justify-center p-2 border-r border-[var(--border-color)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt={preview.title}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded"
          />
        </div>
      )}
      <div className="p-3 flex flex-col justify-between overflow-hidden">
        <div className="space-y-0.5">
          <h4 className="text-[12px] font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-lavender-400 transition-colors">
            {preview.title}
          </h4>
          {preview.description && (
            <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 leading-relaxed">
              {preview.description}
            </p>
          )}
        </div>
        <span className="text-[9px] text-[var(--text-muted)] tracking-wider uppercase mt-1">
          {hostname}
        </span>
      </div>
    </a>
  );
}

export function ImageGenerationProgress({
  progress,
  step,
  totalSteps,
  preview,
}: {
  progress: number;
  step: number;
  totalSteps: number;
  preview?: string;
}) {
  const previewSrc = preview
    ? (preview.startsWith('data:') ? preview : `data:image/png;base64,${preview}`)
    : null;

  return (
    <span className="block my-3 relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-[#09090b] max-w-lg aspect-square w-full shadow-2xl flex flex-col justify-between p-6 select-none">
      {/* Background preview image */}
      {previewSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={previewSrc}
          alt="Generating preview"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-90 z-0"
        />
      ) : (
        // Pulsing placeholder when no preview is loaded yet
        <span className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,var(--accent-light)_0%,#09090b_80%)] opacity-80 animate-pulse flex items-center justify-center">
          <span className="text-[14px] font-medium text-zinc-400 uppercase tracking-widest">Starting...</span>
        </span>
      )}

      {/* Dark overlay gradients for readability */}
      <span className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70 z-10 pointer-events-none" />

      {/* Top-Left Floating Metadata Card */}
      <span className="self-start bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-[12px] font-medium text-zinc-100 flex flex-col gap-1 z-25 shadow-lg">
        <span>Juggernaut XL</span>
      </span>

      {/* Bottom Progress Bar & Sampling Status */}
      <span className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 z-20 shadow-lg">
        <span className="flex items-center justify-between text-zinc-200 text-[13px] font-medium">
          <span>Step {step || 0} of {totalSteps || 20}</span>
          <span className="text-[var(--accent)] font-bold">{progress}%</span>
        </span>
        
        {/* Glow Progress Bar */}
        <span className="w-full h-1.5 bg-zinc-850/80 rounded-full overflow-hidden block">
          <span
            className="h-full bg-[var(--accent)] transition-all duration-300 ease-out rounded-full block shadow-[0_0_8px_var(--accent)]"
            style={{ width: `${progress}%` }}
          />
        </span>
      </span>
    </span>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (content.startsWith('[GENERATING_IMAGE_PROGRESS:')) {
    try {
      const jsonStr = content.substring('[GENERATING_IMAGE_PROGRESS:'.length, content.length - 1);
      const data = JSON.parse(jsonStr);
      return <ImageGenerationProgress {...data} />;
    } catch {
      // Fallback
    }
  }

  return (
    <div className="markdown-content notranslate" translate="no">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match?.[1] || ''}
                value={String(children).replace(/\n$/, '')}
              />
            );
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          pre({ children, ...props }) {
            // Let code component handle pre blocks
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-lavender-400 hover:text-lavender-300 underline font-medium break-all">
                {children}
              </a>
            );
          },
          p({ children }) {
            return <div className="mb-4 leading-relaxed">{children}</div>;
          },
          img({ src, alt }) {
            return <MarkdownImage src={src as string} alt={alt as string} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function MarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span 
        onClick={() => setIsOpen(true)}
        className="block my-3 relative overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-black max-w-lg aspect-square w-full shadow-md cursor-pointer hover:border-zinc-700 transition-colors"
      >
        <ImageLoader
          src={src || ''}
          alt={alt || 'Generated image'}
          gridSize={15}
          cellGap={15}
          cellShape="square"
          cellColor="#52525b"
          blinkSpeed={1500}
          transitionDuration={500}
          fadeOutDuration={600}
          loadingDelay={1500}
          width={512}
          height={512}
          className="w-full h-full"
        />
      </span>

      {/* Lightbox Modal */}
      {isOpen && src && (
        <span 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] animate-in fade-in duration-200 cursor-zoom-out"
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer transition-all border border-white/10 z-[10000]"
            aria-label="Close image"
          >
            <X size={20} />
          </button>
          
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || "Lightbox image"}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-250 cursor-default"
          />
        </span>
      )}
    </>
  );
}
