'use client';

import { useState, useEffect, useRef } from 'react';
import { IMessage } from '@/types';
import { MarkdownRenderer, LinkPreview } from './MarkdownRenderer';
import {
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreHorizontal,
  Trash2,
  FileText,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: IMessage;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  onLike?: (messageId: string, liked: boolean) => void;
  onRetry?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export function MessageBubble({
  message,
  isStreaming = false,
  onCopy,
  onLike,
  onRetry,
  onDeleteMessage,
  onEdit,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEdit?.(message._id, editContent.trim());
    }
    setIsEditing(false);
  };

  if (message.role === 'user') {
    return (
      <div
        className="flex flex-col items-end group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {isEditing ? (
          <div className="w-full max-w-[85%] bg-lavender-50 dark:bg-lavender-900/20 rounded-2xl p-3 border border-lavender-200 dark:border-lavender-800">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-transparent resize-none text-[14.5px] leading-relaxed text-[var(--text-primary)] font-sans h-20"
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1 rounded-lg text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 rounded-lg text-[12px] font-medium bg-lavender-500 text-white hover:bg-lavender-600 transition-colors"
              >
                Save & Submit
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl rounded-br-md',
                'bg-lavender-50 dark:bg-lavender-900/20',
                'text-[var(--text-primary)]',
                'text-[14.5px] leading-relaxed',
              )}
              style={{ padding: 'var(--chat-message-padding, 12px 16px)' }}
            >
              {message.content}
            </div>

            {/* User message actions */}
            {!isStreaming && (
              <div
                className={cn(
                  'flex items-center gap-0.5 mt-1 transition-opacity duration-150 mr-1',
                  showActions ? 'opacity-100' : 'opacity-0',
                )}
              >
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  aria-label="Copy"
                >
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  aria-label="Share"
                >
                  {shared ? <Check size={12} className="text-green-500" /> : <Share2 size={12} />}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden mt-0.5">
          <img
            src="/omlogo.png"
            alt="OpenMind AI"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] leading-relaxed text-[var(--text-primary)]">
            <MarkdownRenderer content={message.content} />
          </div>

          {/* Link previews stacked underneath */}
          {!isStreaming && (() => {
            const urlRegex = /(https?:\/\/[^\s)\],<>"\*]+|www\.[^\s)\],<>"\*]+|\b[a-zA-Z0-9-]+\.(?:com|net|org|edu|gov|mil|co|io|tv|cc|xyz|info|biz)(?:\/[^\s)\],<>"\*]*)?\b)/gi;
            const matches = message.content.match(urlRegex) || [];

            // Format matched domains to have a proper protocol prefix
            const formattedMatches = matches.map(url => {
              if (url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')) {
                return url;
              }
              if (url.toLowerCase().startsWith('www.')) {
                return `https://${url}`;
              }
              return `https://${url}`;
            });

            // Exclude URLs that are part of markdown image tags
            const imageMarkdownRegex = /!\[.*?\]\((.*?)\)/g;
            const imageUrls: string[] = [];
            let imgMatch;
            while ((imgMatch = imageMarkdownRegex.exec(message.content)) !== null) {
              if (imgMatch[1]) {
                // Strip query params or clean up matching string if needed
                imageUrls.push(imgMatch[1].trim());
              }
            }

            const filteredMatches = formattedMatches.filter(url => {
              const lowerUrl = url.toLowerCase();
              if (lowerUrl.includes('example.com')) return false;
              return !imageUrls.some(imgUrl => imgUrl.includes(url) || url.includes(imgUrl));
            });

            const uniqueUrls = Array.from(new Set(filteredMatches));

            if (uniqueUrls.length === 0) return null;

            return (
              <div className="mt-3 flex flex-col gap-2">
                {uniqueUrls.map((url) => (
                  <LinkPreview key={url} href={url} />
                ))}
              </div>
            );
          })()}

          {/* Model indicator */}
          {message.model && !isStreaming && (
            <div className="mt-2 text-[11px] text-[var(--text-muted)]">
              {message.model}
            </div>
          )}

          {/* Actions */}
          {!isStreaming && (
            <div
              className={cn(
                'flex items-center gap-0.5 mt-2 transition-opacity duration-150',
                showActions ? 'opacity-100' : 'opacity-0',
              )}
            >
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                aria-label="Copy message"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="Retry"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <button
                onClick={() => onLike?.(message._id, true)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  message.liked === true
                    ? 'text-lavender-500 bg-lavender-50 dark:bg-lavender-900/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                )}
                aria-label="Like"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => onLike?.(message._id, false)}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  message.liked === false
                    ? 'text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                )}
                aria-label="Dislike"
              >
                <ThumbsDown size={14} />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                aria-label="Share"
              >
                {shared ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
              </button>

              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>

                <div
                  className={cn(
                    "absolute bottom-full left-0 mb-1 z-50 w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 text-[13px] transition-all duration-150 origin-bottom-left overflow-hidden",
                    showMoreMenu
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  )}
                >
                  <button
                    onClick={() => {
                      handleCopy();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  >
                    <Copy size={13} />
                    <span>Copy Raw Text</span>
                  </button>
                  {onRetry && (
                    <button
                      onClick={() => {
                        onRetry();
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                    >
                      <RefreshCw size={13} />
                      <span>Regenerate Response</span>
                    </button>
                  )}
                  {onDeleteMessage && (
                    <>
                      <div className="border-t border-[var(--border-color)] my-1" />
                      <button
                        onClick={() => {
                          onDeleteMessage(message._id);
                          setShowMoreMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={13} />
                        <span>Delete Message</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
