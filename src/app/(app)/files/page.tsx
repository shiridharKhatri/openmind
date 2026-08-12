'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Search,
  Trash2,
  FileText,
  Image as ImageIcon,
  Table,
  File,
  FolderOpen,
  X,
} from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

interface FileItem {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

function getFileIconDetails(mimeType: string) {
  if (mimeType.startsWith('image/')) return { icon: ImageIcon, color: 'text-amber-500 bg-amber-500/10' };
  if (mimeType === 'application/pdf') return { icon: FileText, color: 'text-rose-500 bg-rose-500/10' };
  if (mimeType.includes('csv') || mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { icon: Table, color: 'text-emerald-500 bg-emerald-500/10' };
  return { icon: File, color: 'text-sky-500 bg-sky-500/10' };
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/files?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFiles();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchFiles]);

  const handleUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchFiles();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/files/${id}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <div className="mb-1.5">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Files
              </h1>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] font-medium">
              Upload and manage private documents for local AI research
            </p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-gradient-to-r from-lavender-500 to-lavender-600 dark:from-lavender-600 dark:to-lavender-750 text-white hover:opacity-90 hover:shadow-lg hover:shadow-lavender-500/10 active:scale-[0.98] transition-all cursor-pointer">
            <Upload size={14} className="stroke-[2.5]" />
            <span>Upload files</span>
            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.txt,.docx,.csv,.png,.jpg,.jpeg,.gif,.webp"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by original filename..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-lavender-500/80 transition-colors shadow-sm"
          />
        </div>

        {/* Premium Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 relative overflow-hidden bg-gradient-to-br',
            isDragging
              ? 'border-lavender-500 from-lavender-500/10 to-indigo-500/5 scale-[1.01] shadow-lg shadow-lavender-500/5'
              : 'border-[var(--border-color)] from-[var(--bg-card)]/40 to-transparent hover:border-lavender-400/40 hover:from-[var(--bg-card)]/60',
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className={cn("p-4 rounded-full transition-all duration-300", isDragging ? "bg-lavender-500/20 text-lavender-600 dark:text-lavender-400 scale-110" : "bg-[var(--bg-surface)] text-[var(--text-muted)]")}>
              <Upload size={32} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[var(--text-primary)] mb-1">
                {uploading ? 'Adding documents to database...' : 'Drag & drop files here'}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] font-medium">
                Supports PDF, TXT, DOCX, CSV, and Images (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Files grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-[var(--bg-hover)]/30 animate-pulse border border-[var(--border-color)]/10" />
            ))}
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => {
              const { icon: Icon, color: iconColor } = getFileIconDetails(file.mimeType);
              return (
                <div
                  key={file._id}
                  className="p-4 rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-card)]/60 dark:bg-[var(--bg-card)]/25 backdrop-blur-md hover:border-lavender-400/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4 mb-2.5">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", iconColor)}>
                      <Icon size={16} />
                    </div>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                      aria-label={`Delete ${file.originalName}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[var(--text-primary)] truncate mb-0.5" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-card)]/20 border border-[var(--border-color)]/20 rounded-3xl">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] text-[var(--text-muted)] flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={24} />
            </div>
            <h3 className="text-[14.5px] font-bold text-[var(--text-primary)] mb-1">
              No files uploaded yet
            </h3>
            <p className="text-[12.5px] text-[var(--text-muted)] max-w-sm mx-auto font-medium leading-relaxed">
              Upload local documents, research papers, or spreadsheets to reference them in your chat conversations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
