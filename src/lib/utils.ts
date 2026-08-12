import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days <= 7) return `${days} days ago`;
  if (days <= 30) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function groupByDate<T extends { createdAt: Date | string }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const label = formatDate(item.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }

  return groups;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

export function generateTitle(content: string): string {
  // Take the first sentence or first 60 chars
  const firstSentence = content.split(/[.!?\n]/)[0]?.trim();
  if (firstSentence && firstSentence.length <= 60) return firstSentence;
  return truncate(content, 60);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('csv') || mimeType.includes('spreadsheet')) return 'Table';
  if (mimeType.includes('document') || mimeType.includes('docx')) return 'FileText';
  return 'File';
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
