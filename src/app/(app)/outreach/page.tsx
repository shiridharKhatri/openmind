'use client';

import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle, HelpCircle, Loader2, Sparkles, Copy, Send } from 'lucide-react';

export default function OutreachPage() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [outreachType, setOutreachType] = useState<string>('LinkedIn Recruiter Message');
  const [company, setCompany] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [outreachText, setOutreachText] = useState<string>('');
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

  const handleGenerateOutreach = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/resume/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'outreach',
          resumeData: resumeData || {},
          outreachType,
          company,
          contactName,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate outreach pitch');
      }
      const data = await res.json();
      setOutreachText(data.text);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to generate message. Ensure Ollama service is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!outreachText) return;
    navigator.clipboard.writeText(outreachText);
    alert('Outreach pitch copied to clipboard!');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] select-text">
      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-1">
          <div className="text-[12px] font-semibold text-[var(--text-secondary)] tracking-wide flex items-center gap-1.5">
            <span>Dashboard</span>
            <span className="text-[var(--text-muted)] text-[10px]">&gt;</span>
            <span className="text-lavender-500">Cold Outreach</span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Cold Outreach Generator</h1>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Formulate high-response recruiter pitches and referral template messages.
          </p>
        </div>

        {/* Warning if no resume data loaded */}
        {!resumeData && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm animate-in fade-in-50 duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold">No Active Resume Found</h4>
              <p className="text-[11.5px] leading-relaxed font-medium text-[var(--text-secondary)]">
                Please create a profile in the <a href="/resume" className="underline font-bold text-lavender-400 hover:text-lavender-500 transition-colors">Resume Builder</a> first so pitches are customized to your history.
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Setup Controls (Col span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-3">
                <span className="font-semibold text-[var(--text-secondary)]">Outreach Parameters</span>
                {resumeData && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-medium">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Loaded</span>
                  </div>
                )}
              </div>

              {resumeData && (
                <div className="p-3.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] font-medium">
                  Sender: <strong className="text-[var(--text-primary)]">{resumeData.personal.fullName}</strong>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Outreach Format / Platform</label>
                <select
                  value={outreachType}
                  onChange={(e) => setOutreachType(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)]/60 rounded-lg px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-450 focus:ring-1 focus:ring-lavender-450/20 cursor-pointer"
                >
                  <option>LinkedIn Recruiter Message</option>
                  <option>Cold Email to hiring manager</option>
                  <option>Request for Referral connection</option>
                  <option>Alumni networking request</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)]/65 rounded-lg px-3.5 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-450"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)]/65 rounded-lg px-3.5 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-450"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-semibold">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <button
                onClick={handleGenerateOutreach}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-lg bg-lavender-500 text-white font-semibold hover:bg-lavender-600 transition-all disabled:opacity-40 shadow flex items-center gap-2 cursor-pointer text-[13px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Formulating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Pitch Template</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: Pitch display (Col span 7) */}
          <div className="lg:col-span-7">
            {outreachText ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
                  <span className="text-[12px] font-bold text-[var(--text-secondary)]">Draft Output</span>
                  <button
                    onClick={handleCopy}
                    className="text-[12px] font-bold text-lavender-500 hover:text-lavender-600 hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy message</span>
                  </button>
                </div>
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)]/30 rounded-lg p-4 text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap text-justify font-medium">
                  {outreachText}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
                <Send className="w-8 h-8 text-lavender-450/70 rotate-45" />
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Pitch Output</h4>
                  <p className="text-[12px] text-[var(--text-muted)] leading-relaxed font-medium">
                    Configure your platform parameters on the left and start generation. Your outreach message will display here.
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
