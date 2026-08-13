'use client';

import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle, HelpCircle, Loader2, Sparkles, TrendingUp } from 'lucide-react';

export default function ATSPage() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsKeywords, setAtsKeywords] = useState<string[]>([]);
  const [atsSuggestions, setAtsSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
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

  const handleRunATS = async () => {
    if (!jobDescription.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/resume/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          resumeData: resumeData || {},
          jobDescription,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to parse response from assistant');
      }
      const resData = await res.json();
      setAtsScore(resData.score);
      setAtsKeywords(resData.missingKeywords || []);
      setAtsSuggestions(resData.suggestions || []);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to scan ATS score. Ensure Ollama service is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-1">
          <div className="text-[12px] font-semibold text-[var(--text-secondary)] tracking-wide flex items-center gap-1.5">
            <span>Dashboard</span>
            <span className="text-[var(--text-muted)] text-[10px]">&gt;</span>
            <span className="text-lavender-500">ATS Scorer</span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">ATS Scorer & Optimizer</h1>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Verify keyword alignment and compatibility to bypass tracking system filters.
          </p>
        </div>

        {/* Warning if no resume data loaded */}
        {!resumeData && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm animate-in fade-in-50 duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold">No Active Resume Found</h4>
              <p className="text-[12px] leading-relaxed font-medium text-[var(--text-secondary)]">
                We couldn't detect any structured details. Please create one in the <a href="/resume" className="underline font-bold text-lavender-400 hover:text-lavender-500 transition-colors">Resume Builder</a> first so the optimizer can scan your work history, skills, and projects.
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Inputs (Col span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-4">
                <span className="font-semibold text-[var(--text-secondary)]">Job Details</span>
                {resumeData && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-medium">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Resume Loaded</span>
                  </div>
                )}
              </div>

              {resumeData && (
                <div className="p-3.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)] font-medium">
                  Analyzing resume profile for: <strong className="text-[var(--text-primary)]">{resumeData.personal.fullName}</strong>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description details here (skills, qualifications, responsibilities)..."
                  className="w-full min-h-[300px] bg-transparent text-[14px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 resize-none border-0 p-0"
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

            <div className="flex items-center">
              <button
                onClick={handleRunATS}
                disabled={isAnalyzing || !jobDescription.trim()}
                className="px-6 py-2.5 rounded-lg bg-lavender-500 text-white font-semibold hover:bg-lavender-600 transition-all disabled:opacity-40 shadow flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Scan & Optimize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Metrics & Score (Col span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {atsScore === null ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm min-h-[350px]">
                <TrendingUp className="w-8 h-8 text-lavender-450/70" />
                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-[14px] font-bold text-[var(--text-primary)]">Ready for Analysis</h4>
                  <p className="text-[12px] text-[var(--text-muted)] leading-relaxed font-medium">
                    Once you paste target requirements and scan, compatibility reporting will render here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* Score Summary Card */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-lavender-500 to-indigo-500 p-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[18px] font-bold text-lavender-400">
                        {atsScore}%
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[13.5px] font-bold text-[var(--text-primary)]">Compatibility Match</h4>
                      <p className="text-[11.5px] text-[var(--text-muted)] font-medium leading-relaxed mt-1">
                        {atsScore >= 80 ? 'Excellent match! Profile aligns well with target details.' :
                         atsScore >= 60 ? 'Moderate keyword alignment. Adjust details to improve score.' :
                         'Low compatibility. Integrate recommended keywords below.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords Card */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
                    <span className="text-[12px] font-bold text-[var(--text-secondary)]">Missing Core Terms</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20">{atsKeywords.length} Detected</span>
                  </div>

                  {atsKeywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {atsKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-550 dark:text-red-400 text-[11px] font-semibold rounded-lg border border-red-550/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-emerald-500 font-bold">✓ Perfect match! No missing terms.</p>
                  )}
                </div>

                {/* Suggestions Card */}
                {atsSuggestions.length > 0 && (
                  <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm space-y-4">
                    <span className="text-[12px] font-bold text-[var(--text-secondary)] border-b border-[var(--border-color)]/30 pb-3 block">
                      Improvement Actions
                    </span>
                    <ul className="space-y-2.5 pl-4 list-disc text-[12.5px] text-[var(--text-secondary)] leading-relaxed text-justify">
                      {atsSuggestions.map((suggestion, i) => (
                        <li key={i} className="marker:text-lavender-500">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
