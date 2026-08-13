'use client';

import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle, HelpCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface ChatMessage {
  role: 'candidate' | 'interviewer';
  content: string;
  feedback?: string;
}

export default function InterviewPage() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [interviewChat, setInterviewChat] = useState<ChatMessage[]>([]);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isInterviewLoading, setIsInterviewLoading] = useState<boolean>(false);
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

  const handleSendInterviewMessage = async (isStart = false) => {
    if (!isStart && !userAnswer.trim()) return;
    setIsInterviewLoading(true);
    setErrorMsg(null);

    const activeHistory = isStart ? [] : [...interviewChat];
    if (!isStart) {
      activeHistory.push({ role: 'candidate', content: userAnswer });
      setInterviewChat(activeHistory);
      setUserAnswer('');
    } else {
      setInterviewChat([]);
    }

    try {
      const res = await fetch('/api/resume/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'interview',
          resumeData: resumeData || {},
          jobDescription: jobDescription || 'Full Stack Software Engineer',
          chatHistory: activeHistory.map(h => ({
            role: h.role === 'candidate' ? 'user' : 'assistant',
            content: h.content,
          })),
          userAnswer: isStart ? '' : userAnswer,
        }),
      });
      if (!res.ok) {
        throw new Error('Interview server response failed');
      }
      const resData = await res.json();
      
      setInterviewChat(prev => {
        const nextChat = [...prev];
        if (resData.feedback && nextChat.length > 0) {
          nextChat[nextChat.length - 1].feedback = resData.feedback;
        }
        nextChat.push({ role: 'interviewer', content: resData.question });
        return nextChat;
      });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to start interview prep. Make sure Ollama service is active.');
    } finally {
      setIsInterviewLoading(false);
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
            <span className="text-lavender-500">Interview Prep</span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Interview Prep Simulator</h1>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              How it works
            </button>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Practice interview questions with interactive Recruiter agents and get coaching insights.
          </p>
        </div>

        {/* Warning if no resume data loaded */}
        {!resumeData && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm animate-in fade-in-50 duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[13px] font-bold">No Active Resume Found</h4>
              <p className="text-[11.5px] leading-relaxed font-medium text-[var(--text-secondary)]">
                We suggest setting up details in the <a href="/resume" className="underline font-bold text-lavender-400 hover:text-lavender-500 transition-colors">Resume Builder</a> first so questions align with your real work history.
              </p>
            </div>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Setup Controls (Col span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-3">
                <span className="font-semibold text-[var(--text-secondary)]">Assessment Setup</span>
                {resumeData && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[10.5px] font-bold">
                    <FileCheck className="w-3 h-3 mr-1" />
                    <span>Connected</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9.5px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Target Job description</label>
                <textarea
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect at Stripe specializing in React dashboards and CSS design..."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3.5 py-2.5 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-450 resize-none transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleSendInterviewMessage(true)}
                  disabled={isInterviewLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-lavender-500 hover:bg-lavender-600 disabled:opacity-40 text-white text-[12px] font-semibold transition-all shadow-sm cursor-pointer"
                >
                  {isInterviewLoading && interviewChat.length === 0 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Panel...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Simulator</span>
                    </>
                  )}
                </button>

                {interviewChat.length > 0 && (
                  <button
                    onClick={() => setInterviewChat([])}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/5 text-red-500 text-[11.5px] font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Simulation</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Chat Dialogue (Col span 8) */}
          <div className="lg:col-span-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col h-[600px] shadow-sm">
              {/* Header bar */}
              <div className="px-5 py-3 border-b border-[var(--border-color)]/30 bg-[var(--bg-sidebar)]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[12px] font-bold text-[var(--text-secondary)]">Mock HR Recruiter Online</span>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded border border-[var(--border-color)]/50">Round 1</span>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--bg-surface)]/10 scrollbar-thin">
                {interviewChat.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <Sparkles className="w-6 h-6 text-lavender-450/70" />
                    <div className="space-y-1 max-w-xs">
                      <h4 className="text-[13px] font-bold text-[var(--text-primary)]">Ready for Mock Prep</h4>
                      <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed font-medium">
                        Setup the job specifications on the left pane and initialize to begin simulation.
                      </p>
                    </div>
                  </div>
                ) : (
                  interviewChat.map((msg, i) => (
                    <div key={i} className="space-y-3.5 animate-in fade-in-50 duration-200">
                      {msg.role === 'interviewer' ? (
                        <div className="flex items-start gap-3 max-w-[85%]">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-lavender-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                            HR
                          </div>
                          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)]/50 px-4 py-2.5 rounded-xl rounded-tl-none text-[13px] text-[var(--text-primary)] font-medium leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2.5 ml-auto max-w-[85%]">
                          <div className="bg-lavender-500 text-white px-4 py-2.5 rounded-xl rounded-tr-none text-[13px] font-medium leading-relaxed">
                            {msg.content}
                          </div>
                          {msg.feedback && (
                            <div className="bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-[11.5px] leading-relaxed font-medium max-w-[90%] shadow-inner">
                              💡 <strong>Coach Feedback:</strong> {msg.feedback}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {isInterviewLoading && (
                  <div className="flex items-center gap-2 text-lavender-450 text-[11px] font-bold pl-1 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing response...</span>
                  </div>
                )}
                
                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-semibold">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Chat Input panel */}
              {interviewChat.length > 0 && (
                <div className="p-3 border-t border-[var(--border-color)]/30 bg-[var(--bg-sidebar)]/50 flex gap-3">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendInterviewMessage()}
                    placeholder="Type your response to the HR manager..."
                    className="flex-1 bg-[var(--bg-input)] border border-[var(--border-color)]/50 rounded-lg px-4 py-2 text-[12.5px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-450"
                  />
                  <button
                    onClick={() => handleSendInterviewMessage()}
                    disabled={isInterviewLoading || !userAnswer.trim()}
                    className="px-4 py-2 text-[12.5px] font-bold text-white bg-lavender-500 hover:bg-lavender-600 disabled:opacity-50 rounded-lg transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    Send
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
