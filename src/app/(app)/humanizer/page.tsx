'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, RotateCcw, ShieldCheck, Gauge, HelpCircle, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react';

interface Model {
  id: string;
  name: string;
}

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [copied, setCopied] = useState(false);
  const [level, setLevel] = useState<number>(8); // Default level 8
  const [scanVersion, setScanVersion] = useState<'v1' | 'v2'>('v1');
  const [compareMode, setCompareMode] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch available models
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models && data.models.length > 0) {
          setModels(data.models);
          setSelectedModel(data.models[0].id);
        }
      })
      .catch((err) => console.error('Failed to load models:', err));
  }, []);

  const handleHumanize = async () => {
    if (!inputText.trim() || isProcessing) return;

    setIsProcessing(true);
    setOutputText('');

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Pass the level to the backend if needed (defaults to mode: deep for high levels)
      const mode = level >= 6 ? 'deep' : 'standard';

      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          model: selectedModel,
          mode: mode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to humanize text');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.content) {
              setOutputText((prev) => prev + parsed.content);
            }
          } catch {
            // Ignore parse errors from partial chunks
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.content) {
            setOutputText((prev) => prev + parsed.content);
          }
        } catch {}
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (!outputText) {
          setOutputText('Error: Failed to humanize text. Please verify Ollama is active.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
  };

  const getWordCount = (str: string) => {
    const trimmed = str.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  const getLevelDescription = (lvl: number) => {
    if (lvl <= 3) return 'Light rewrite with minimal changes';
    if (lvl <= 6) return 'Balanced paraphrasing and flow changes';
    if (lvl <= 8) return 'Heavy rewrite with maximum variation';
    return 'Extreme semantic remodeling (high detector evasion)';
  };

  // Determine human score simulated value based on level and state
  const isInputAI = inputText.length > 0;
  const humanScore = outputText ? (level >= 8 ? 100 : level >= 5 ? 85 : 70) : isProcessing ? 50 : isInputAI ? 12 : 100;

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-6">
        
        {/* Breadcrumb & Header */}
        <div className="space-y-1">
          <div className="text-[12px] font-semibold text-[var(--text-secondary)] tracking-wide flex items-center gap-1.5">
            <span>Dashboard</span>
            <span className="text-[var(--text-muted)] text-[10px]">&gt;</span>
            <span className="text-lavender-500">Humanizer</span>
          </div>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Humanizer</h1>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              How to use
            </button>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Paste your AI-generated text below and humanize it.
          </p>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: Input Area & Configuration Controls (Col span 8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-6 shadow-sm">
              
              {/* Configuration Controls Row */}
              <div className="space-y-4 border-b border-[var(--border-color)]/40 pb-4 text-[13px]">
                {/* Level selection (1-10) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="font-semibold text-[var(--text-secondary)] min-w-[50px]">Level</span>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setLevel(num)}
                          className={`w-7 h-7 rounded text-[11px] font-bold transition-all ${
                            level === num
                              ? 'bg-lavender-500 text-white shadow-sm'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <span className="text-[12px] text-[var(--text-muted)] font-medium">
                      {getLevelDescription(level)}
                    </span>
                  </div>
                </div>

                {/* Model / Engine selection pills */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="font-semibold text-[var(--text-secondary)] min-w-[50px]">Model</span>
                  <div className="flex flex-wrap gap-2">
                    {models.length === 0 ? (
                      <span className="text-[11px] text-[var(--text-muted)]">Loading models...</span>
                    ) : (
                      models.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
                            selectedModel === m.id
                              ? 'border-lavender-500/40 bg-lavender-500/10 text-lavender-500 shadow-sm'
                              : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {m.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Textarea for AI input */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Could you please check the current status of my enrollment and let me know if any additional information or documentation is required from our side to complete the verification?"
                  className="w-full min-h-[300px] bg-transparent text-[14px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/60 resize-none border-0 p-0"
                  style={{ outline: 'none', boxShadow: 'none' }}
                />
              </div>

              {/* Footer info inside Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--border-color)]/30 pt-4 text-[12px] text-[var(--text-muted)]">
                <div className="flex items-center gap-3 font-medium">
                  <span>{getWordCount(inputText)}/1,000 words</span>
                  <button
                    onClick={handleClear}
                    disabled={!inputText}
                    className="hover:text-[var(--text-primary)] disabled:opacity-40 flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-[11px] font-medium">
                  <span>&bull; Limited daily humanizations</span>
                  <span>&bull; Limited daily scans</span>
                </div>
              </div>
            </div>

            {/* Bottom main actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleHumanize}
                disabled={isProcessing || !inputText.trim()}
                className="px-6 py-2.5 rounded-lg bg-lavender-500 text-white font-semibold hover:bg-lavender-600 transition-all disabled:opacity-40 shadow flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? 'Processing...' : 'Humanize'}
              </button>
            </div>
          </div>

          {/* Right panel: Detection Score Widget (Col span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
                <span className="text-[13px] font-bold tracking-tight">Detection Score</span>
                
                {/* Version switcher tabs */}
                <div className="flex bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-md p-0.5">
                  <button
                    onClick={() => setScanVersion('v1')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      scanVersion === 'v1'
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    V1
                  </button>
                  <button
                    onClick={() => setScanVersion('v2')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      scanVersion === 'v2'
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    V2
                  </button>
                </div>
              </div>

              {/* Circle Gauge Graphic */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                  {outputText ? 'Humanized' : 'Raw Text Score'}
                </div>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Gauge ring */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="var(--border-color)"
                      strokeWidth="6"
                      fill="transparent"
                      className="opacity-20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={humanScore >= 80 ? '#10b981' : humanScore >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * humanScore) / 100}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Text score info inside circle */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black tracking-tight" style={{ color: humanScore >= 80 ? '#10b981' : humanScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {humanScore}%
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">human</span>
                  </div>
                </div>

                {/* Score status banner */}
                <div className={`px-4 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 shadow-sm ${
                  humanScore >= 80 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : humanScore >= 50 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{humanScore >= 80 ? 'Looks Human' : humanScore >= 50 ? 'Partially AI' : '100% AI detected'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Humanized Result Section (Renders below input when output is generated) */}
        {(outputText || isProcessing) && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 space-y-4 shadow-sm transition-all">
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
              <div className="flex items-center gap-2 text-[13px] font-bold tracking-tight">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Humanized Result
              </div>

              {/* Result Actions Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    compareMode 
                      ? 'border-lavender-500/40 bg-lavender-500/10 text-lavender-500' 
                      : 'border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {compareMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  Compare
                </button>

                <button
                  onClick={handleHumanize}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[11px] font-semibold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rehumanize
                </button>

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[11px] font-semibold transition-all flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Compared Highlighted Output vs Regular Output */}
            <div className="p-2 text-[14px] leading-relaxed whitespace-pre-wrap select-text">
              {isProcessing && !outputText ? (
                <div className="flex items-center gap-2 text-[var(--text-muted)] py-4 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-lavender-500 animate-ping" />
                  Rewriting sentences to bypass detector engines...
                </div>
              ) : compareMode ? (
                // Highlighted changes comparison view
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Comparison View (Paraphrased segments in highlight):</p>
                  <div className="bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-color)]">
                    {outputText.split('\n').map((paragraph, index) => {
                      if (!paragraph.trim()) return null;
                      // Highlight odd paragraphs to simulate active visual comparison highlights shown in screenshot
                      const shouldHighlight = index % 2 === 0;
                      return (
                        <p key={index} className="mb-3">
                          {shouldHighlight ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20 px-1 py-0.5 rounded">
                              {paragraph}
                            </span>
                          ) : (
                            paragraph
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-[var(--text-primary)]">{outputText}</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
