'use client';

import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle, HelpCircle, Loader2, Sparkles, Copy, Download, Mail } from 'lucide-react';

export default function CoverLetterPage() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [coverLetterText, setCoverLetterText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('resume_builder_data');
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved resume data');
      }
    }
  }, []);

  const handleGenerateLetter = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/resume/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cover-letter',
          resumeData: resumeData || {},
          jobDescription,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate cover letter');
      }
      const data = await res.json();
      setCoverLetterText(data.text);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to generate cover letter. Ensure Ollama is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetterText) return;
    navigator.clipboard.writeText(coverLetterText);
    alert('Cover letter copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] select-text">
      {/* Print-specific overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 0; }
          .no-print { display: none !important; }
          body, html, main, #__next, .flex-1 {
            background: white !important;
            color: black !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
          }
          #print-letter-container {
            position: relative !important;
            transform: scale(1) !important;
            margin: 0 !important;
            padding: 25mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
      `}} />

      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-1 no-print">
          <div className="text-[12px] font-semibold text-[var(--text-secondary)] tracking-wide flex items-center gap-1.5">
            <span>Dashboard</span>
            <span className="text-[var(--text-muted)] text-[10px]">&gt;</span>
            <span className="text-lavender-500">Cover Letter</span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Cover Letter Generator</h1>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Draft formal, personalized pitch letters tailored to job openings.
          </p>
        </div>

        {/* Warning if no resume data loaded */}
        {!resumeData && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm no-print">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold">No Active Resume Found</h4>
              <p className="text-[11.5px] leading-relaxed font-medium text-[var(--text-secondary)]">
                Please create a profile in the <a href="/resume" className="underline font-bold text-lavender-400 hover:text-lavender-500 transition-colors">Resume Builder</a> first so cover letters align with your background history.
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Inputs (Col span 6) */}
          <div className="lg:col-span-6 space-y-6 no-print">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-4">
                <span className="font-semibold text-[var(--text-secondary)]">Custom Parameters</span>
                {resumeData && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-medium">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Resume Loaded</span>
                  </div>
                )}
              </div>

              {resumeData && (
                <div className="p-3.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] font-medium">
                  Tailoring for: <strong className="text-[var(--text-primary)]">{resumeData.personal.fullName}</strong>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste details of target job description here to customize letter details..."
                  className="w-full min-h-[260px] bg-transparent text-[14px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 resize-none border-0 p-0"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-semibold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateLetter}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-lg bg-lavender-500 text-white font-semibold hover:bg-lavender-600 transition-all disabled:opacity-40 shadow flex items-center gap-2 cursor-pointer text-[13px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Draft Pitch Letter</span>
                  </>
                )}
              </button>

              {coverLetterText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-[12.5px] font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-[12.5px] font-semibold rounded-lg border border-lavender-500/25 bg-lavender-500/5 hover:bg-lavender-500/10 text-lavender-400 transition-all cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Pitch Text Display (Col span 6) */}
          <div className="lg:col-span-6 min-h-[400px]">
            {coverLetterText ? (
              <div
                id="print-letter-container"
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-[13.5px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap text-justify shadow-sm font-serif"
              >
                {coverLetterText}
              </div>
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[380px] no-print">
                <Mail className="w-8 h-8 text-lavender-450/70" />
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Ready to Draft</h4>
                  <p className="text-[12px] text-[var(--text-muted)] leading-relaxed font-medium">
                    Configure your parameters on the left and start generation. Your letter will display here.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
