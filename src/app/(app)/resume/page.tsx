'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Globe,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Experience {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Project {
  title: string;
  role: string;
  link: string;
  technologies: string;
  description: string;
}

interface ResumeData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages: string[];
}

const INITIAL_DATA: ResumeData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
};

const DEMO_DATA: ResumeData = {
  personal: {
    fullName: 'Shiridhar Khatri',
    title: 'Full Stack Web & Mobile Developer',
    email: 'shiridhar.khatri@dev.com',
    phone: '+977 9820610923',
    location: 'Pokhara, Nepal',
    website: 'https://shiridhar.com.np',
    linkedin: 'linkedin.com/in/shiridharkhatri',
  },
  summary: 'Full Stack Developer experienced in building responsive web applications and cross-platform mobile apps using Next.js, React Native (Expo), Node.js, and MongoDB. Proven track record of taking projects from scratch to production—handling front-end UI, backend APIs, cloud/VPS deployments, SEO, and app store publishing.',
  experience: [
    {
      company: 'Fishtail Infosolutions',
      role: 'Full Stack Developer Intern',
      location: 'Pokhara, Nepal',
      startDate: 'Nov 2025',
      endDate: 'Present',
      description: '• Built a complete, production-ready HRMS platform (fishtailhrms.com) managing employee attendance, records, and internal company reporting.\n• Shipped mobile-friendly, optimized web code using Next.js, TypeScript, and Node.js.\n• Managed cloud infrastructure deployments utilizing AWS EC2, Contabo VPS, Nginx, Docker, and Coolify.',
    },
    {
      company: 'H Tolin',
      role: 'Freelance Web Developer',
      location: 'Remote',
      startDate: 'Aug 2024',
      endDate: 'Present',
      description: '• Collaborating closely with a U.S.-based client to build, fix, and update features for their live web products.\n• Translated layout designs into highly responsive web pages while maintaining fast load times.',
    },
    {
      company: 'Upwork / Freelancing',
      role: 'Full Stack Developer',
      location: 'Remote',
      startDate: '2023',
      endDate: 'Present',
      description: '• Delivered bespoke web development features and bug solutions for international clients using React, Express, and databases.\n• Integrated modern UI/UX design components with dynamic API backends.',
    }
  ],
  education: [
    {
      school: 'London Metropolitan Univ.',
      degree: 'Bachelor of IT',
      field: 'Computing',
      location: 'London / Nepal',
      startDate: '2024',
      endDate: 'Present',
      description: 'First Class Honors curriculum. Specializing in advanced software design.',
    },
    {
      school: 'Tops English Boarding School',
      degree: 'Management & Comp. Science',
      field: 'Science Stream',
      location: 'Pokhara, Nepal',
      startDate: '2020',
      endDate: '2023',
      description: 'Completed Higher Secondary Education.',
    }
  ],
  projects: [
    {
      title: 'HRMS Corporate Portal',
      role: 'Lead Developer',
      link: 'fishtailhrms.com',
      technologies: 'Next.js, Tailwind, MongoDB, AWS',
      description: 'Developed and maintained the core enterprise resource planning platform to handle internal staff check-ins, record auditing, and administrative workflows.',
    }
  ],
  skills: ['Next.js', 'React Native (Expo)', 'Node.js', 'TypeScript', 'JavaScript', 'TailwindCSS', 'AWS (EC2)', 'Docker', 'Nginx', 'MongoDB', 'PostgreSQL', 'Git & CI/CD'],
  languages: ['English (Professional)', 'Nepali (Native)'],
};

export default function ResumePage() {
  const [data, setData] = useState<ResumeData>(DEMO_DATA);
  const [activeTemplate, setActiveTemplate] = useState<'modern' | 'minimalist' | 'tech' | 'classic' | 'executive' | 'traditional'>('traditional');
  const [zoom, setZoom] = useState<number>(95);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('ai');
  const [aiBackground, setAiBackground] = useState<string>('');
  const [aiMode, setAiMode] = useState<'text' | 'portfolio'>('text');
  const [aiUrl, setAiUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('resume_builder_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved resume data');
      }
    }
  }, []);

  // Save to LocalStorage when data changes
  useEffect(() => {
    if (data && data.personal) {
      localStorage.setItem('resume_builder_data', JSON.stringify(data));
    }
  }, [data]);

  // Field change handlers
  const handlePersonalChange = (field: keyof ResumeData['personal'], value: string) => {
    setData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const handleSummaryChange = (value: string) => {
    setData((prev) => ({
      ...prev,
      summary: value,
    }));
  };

  // Experience handlers
  const addExperience = () => {
    setData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', role: '', location: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setData((prev) => {
      const exp = [...prev.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const removeExperience = (index: number) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Education handlers
  const addEducation = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', field: '', location: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setData((prev) => {
      const edu = [...prev.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, education: edu };
    });
  };

  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Projects handlers
  const addProject = () => {
    setData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: '', role: '', link: '', technologies: '', description: '' },
      ],
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    setData((prev) => {
      const proj = [...prev.projects];
      proj[index] = { ...proj[index], [field]: value };
      return { ...prev, projects: proj };
    });
  };

  const removeProject = (index: number) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Skills & Languages (Comma split)
  const handleSkillsChange = (val: string) => {
    setData((prev) => ({
      ...prev,
      skills: val.split(',').map((s) => s.trim()).filter(Boolean),
    }));
  };

  const handleLanguagesChange = (val: string) => {
    setData((prev) => ({
      ...prev,
      languages: val.split(',').map((l) => l.trim()).filter(Boolean),
    }));
  };

  // Reset / Mock / Import / Export
  const handleReset = () => {
    setData(INITIAL_DATA);
    setErrorMsg(null);
  };

  const handleLoadDemo = () => {
    setData(DEMO_DATA);
    setErrorMsg(null);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${data.personal.fullName.replace(/\s+/g, '_') || 'resume'}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.personal && Array.isArray(parsed.experience)) {
          setData(parsed);
          setErrorMsg(null);
        } else {
          alert('Invalid file format. Please upload a valid exported resume JSON.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // AI Resume generator
  const handleAIGenerate = async () => {
    if (aiMode === 'text' && !aiBackground.trim()) return;
    if (aiMode === 'portfolio' && !aiUrl.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          background: aiMode === 'text' ? aiBackground : undefined,
          url: aiMode === 'portfolio' ? aiUrl : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate resume');
      }

      setData(result);
      setActiveSection('personal'); // Open personal info on success
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during resume generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger browser print
  const handlePrintDownload = () => {
    window.print();
  };

  // Toggle sections in sidebar form
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[var(--bg-surface)] text-[var(--text-primary)]">
      {/* Self-contained styling for screen layout & printable rendering */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume-container, #printable-resume-container * {
            visibility: visible;
          }
          #printable-resume-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            transform: scale(1) !important;
            transform-origin: top left !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />

      {/* LEFT COLUMN: Input Form Panel */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] overflow-hidden">
        {/* Header Controls */}
        <div className="px-5 py-4 border-b border-[var(--border-color)]/30 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[15px] font-extrabold tracking-tight text-[var(--text-primary)]">Resume Builder</h1>
            <p className="text-[11px] text-[var(--text-muted)] font-medium">Create or AI-generate resumes</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-red-500/10 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
              title="Reset data fields"
            >
              <RefreshCw size={11} />
              <span>Clear</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-all cursor-pointer"
              title="Export resume data to JSON file"
            >
              <Download size={11} />
              <span>Export</span>
            </button>
            <button
              onClick={handleImportJSONClick}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-all cursor-pointer"
              title="Import resume data from JSON file"
            >
              <Upload size={11} />
              <span>Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handlePrintDownload}
              className="flex items-center gap-1 px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-lavender-500 hover:bg-lavender-655 rounded-lg transition-all shadow-sm cursor-pointer hover:shadow"
            >
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Form Fields Accordion */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          
          {/* Section: AI Auto Generation (Special Glowing Container) */}
          <div className="border border-lavender-200/50 dark:border-lavender-900/40 rounded-2xl overflow-hidden bg-gradient-to-br from-lavender-50/40 to-transparent dark:from-lavender-900/10 dark:to-transparent">
            <button
              onClick={() => toggleSection('ai')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-lavender-500 animate-pulse" />
                <span className="text-lavender-650 dark:text-lavender-400">Generate Resume with AI</span>
              </div>
              {activeSection === 'ai' ? <ChevronUp size={14} className="text-lavender-400" /> : <ChevronDown size={14} className="text-lavender-400" />}
            </button>

            {activeSection === 'ai' && (
              <div className="p-4 border-t border-lavender-100 dark:border-lavender-900/20 space-y-3 bg-[var(--bg-surface)]/20">
                {/* Tabs to select AI Input Mode */}
                <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
                  <button
                    onClick={() => setAiMode('text')}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      aiMode === 'text'
                        ? 'bg-lavender-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    AI Text Prompt
                  </button>
                  <button
                    onClick={() => setAiMode('portfolio')}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      aiMode === 'portfolio'
                        ? 'bg-lavender-500 text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Portfolio URL
                  </button>
                </div>

                {aiMode === 'text' ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                      Provide your background, career history, key achievements, or raw details to auto-generate structured resume data.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <textarea
                        rows={4}
                        value={aiBackground}
                        onChange={(e) => setAiBackground(e.target.value)}
                        placeholder="e.g. I have 5 years experience as a React Developer, worked at TechCorp scaling dashboards, have B.S. in CS from NYU, built Aura analytics on github, skills: TypeScript, Tailwind, Node."
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 resize-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:text-[11.5px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-medium">
                      Enter the URL of your personal portfolio website. We will fetch and analyze it to construct your resume.
                    </p>
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={aiUrl}
                        onChange={(e) => setAiUrl(e.target.value)}
                        placeholder="https://yourname.dev"
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 placeholder:text-[var(--text-muted)] placeholder:text-[11.5px]"
                      />
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-medium leading-normal">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || (aiMode === 'text' ? !aiBackground.trim() : !aiUrl.trim())}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-lavender-500 to-indigo-500 hover:from-lavender-600 hover:to-indigo-655 disabled:opacity-50 text-white text-[12px] font-bold transition-all shadow-md shadow-lavender-500/10 cursor-pointer active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Analyzing & generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Auto-Generate Resume</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Section: Personal Info */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('personal')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-lavender-500" />
                <span>Personal Info</span>
              </div>
              {activeSection === 'personal' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'personal' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-surface)]/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={data.personal.fullName}
                      onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Job Title</label>
                    <input
                      type="text"
                      value={data.personal.title}
                      onChange={(e) => handlePersonalChange('title', e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={data.personal.email}
                      onChange={(e) => handlePersonalChange('email', e.target.value)}
                      placeholder="john.doe@gmail.com"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      value={data.personal.phone}
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      placeholder="+1 (234) 567-890"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={data.personal.location}
                      onChange={(e) => handlePersonalChange('location', e.target.value)}
                      placeholder="Boston, MA"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Website</label>
                    <input
                      type="text"
                      value={data.personal.website}
                      onChange={(e) => handlePersonalChange('website', e.target.value)}
                      placeholder="johndoe.dev"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1 col-span-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">LinkedIn/GitHub</label>
                    <input
                      type="text"
                      value={data.personal.linkedin}
                      onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                      placeholder="github.com/johndoe"
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Summary */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('summary')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-lavender-500" />
                <span>Professional Summary</span>
              </div>
              {activeSection === 'summary' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'summary' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-surface)]/30">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Summary Statement</label>
                  <textarea
                    rows={4}
                    value={data.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    placeholder="Highly motivated engineer with..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 resize-none text-[var(--text-primary)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Work Experience */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('experience')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-lavender-500" />
                <span>Work Experience</span>
              </div>
              {activeSection === 'experience' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'experience' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-surface)]/30">
                {data.experience.map((exp, index) => (
                  <div key={index} className="p-3.5 border border-[var(--border-color)]/70 rounded-xl bg-[var(--bg-card)] relative space-y-3 shadow-sm">
                    <button
                      onClick={() => removeExperience(index)}
                      className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-[var(--bg-hover)] text-red-500 cursor-pointer transition-colors"
                      title="Remove experience"
                    >
                      <Trash2 size={13} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          placeholder="e.g. Google"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(index, 'role', e.target.value)}
                          placeholder="e.g. Frontend Dev"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          placeholder="Remote"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          placeholder="June 2021"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Job Description</label>
                      <textarea
                        rows={3.5}
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Key responsibilities and achievements..."
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 resize-none text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addExperience}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[var(--border-color)] hover:border-lavender-400 text-lavender-500 hover:text-lavender-655 rounded-xl text-[12px] font-bold transition-all cursor-pointer bg-[var(--bg-card)]/50 hover:bg-[var(--bg-hover)]"
                >
                  <Plus size={13} />
                  <span>Add Work Experience</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Education */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('education')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-lavender-500" />
                <span>Education</span>
              </div>
              {activeSection === 'education' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'education' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-surface)]/30">
                {data.education.map((edu, index) => (
                  <div key={index} className="p-3.5 border border-[var(--border-color)]/70 rounded-xl bg-[var(--bg-card)] relative space-y-3 shadow-sm">
                    <button
                      onClick={() => removeEducation(index)}
                      className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-[var(--bg-hover)] text-red-500 cursor-pointer transition-colors"
                      title="Remove education"
                    >
                      <Trash2 size={13} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          placeholder="e.g. Stanford"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          placeholder="e.g. B.S."
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Field of Study</label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => updateEducation(index, 'field', e.target.value)}
                          placeholder="Computer Science"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          placeholder="2018"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          placeholder="2022"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Description (Optional)</label>
                      <textarea
                        rows={2}
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="Additional details, honors, clubs..."
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 resize-none text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addEducation}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[var(--border-color)] hover:border-lavender-400 text-lavender-500 hover:text-lavender-655 rounded-xl text-[12px] font-bold transition-all cursor-pointer bg-[var(--bg-card)]/50 hover:bg-[var(--bg-hover)]"
                >
                  <Plus size={13} />
                  <span>Add Education</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Projects */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('projects')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FolderGit2 size={14} className="text-lavender-500" />
                <span>Projects</span>
              </div>
              {activeSection === 'projects' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'projects' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-surface)]/30">
                {data.projects.map((proj, index) => (
                  <div key={index} className="p-3.5 border border-[var(--border-color)]/70 rounded-xl bg-[var(--bg-card)] relative space-y-3 shadow-sm">
                    <button
                      onClick={() => removeProject(index)}
                      className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-[var(--bg-hover)] text-red-500 cursor-pointer transition-colors"
                      title="Remove project"
                    >
                      <Trash2 size={13} />
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Project Name</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                          placeholder="Aura Dashboard"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Link / Repository</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => updateProject(index, 'link', e.target.value)}
                          placeholder="github.com/user/aura"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Role (Optional)</label>
                        <input
                          type="text"
                          value={proj.role}
                          onChange={(e) => updateProject(index, 'role', e.target.value)}
                          placeholder="Lead Developer"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                          placeholder="Next.js, Tailwind, Postgres"
                          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Project Description</label>
                      <textarea
                        rows={2.5}
                        value={proj.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="Built X to solve Y resulting in Z..."
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30 resize-none text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addProject}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[var(--border-color)] hover:border-lavender-400 text-lavender-500 hover:text-lavender-655 rounded-xl text-[12px] font-bold transition-all cursor-pointer bg-[var(--bg-card)]/50 hover:bg-[var(--bg-hover)]"
                >
                  <Plus size={13} />
                  <span>Add Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Skills & Languages */}
          <div className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wrench size={14} className="text-lavender-500" />
                <span>Skills & Languages</span>
              </div>
              {activeSection === 'skills' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {activeSection === 'skills' && (
              <div className="p-4 border-t border-[var(--border-color)] space-y-4 bg-[var(--bg-surface)]/30">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={data.skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="React, Next.js, Node.js, Go"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                  />
                  <span className="text-[9.5px] text-[var(--text-muted)] mt-0.5">Separate with commas (e.g. TypeScript, React)</span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Languages (Comma-separated)</label>
                  <input
                    type="text"
                    value={data.languages.join(', ')}
                    onChange={(e) => handleLanguagesChange(e.target.value)}
                    placeholder="English (Fluent), Spanish (Basic)"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-lavender-400 focus:ring-1 focus:ring-lavender-400/30"
                  />
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {/* RIGHT COLUMN: Real-Time Preview Area */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-surface)] overflow-hidden relative">
        
        {/* Template selector header bar */}
        <div className="px-5 py-3 border-b border-[var(--border-color)]/70 flex items-center justify-between gap-3 bg-[var(--bg-card)]/30 backdrop-blur-md z-10">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all min-w-[170px]"
            >
              <span>{
                activeTemplate === 'traditional' ? 'Traditional Serif' :
                activeTemplate === 'modern' ? 'Modern Elegant' :
                activeTemplate === 'minimalist' ? 'Minimalist' :
                activeTemplate === 'tech' ? 'Tech Lead' :
                activeTemplate === 'classic' ? 'Classic ATS' :
                'Executive Chic'
              }</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop overlay to close the dropdown on clicking outside */}
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                
                <div className="absolute left-0 mt-1.5 w-[200px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg py-1.5 z-40">
                  {(['traditional', 'modern', 'minimalist', 'tech', 'classic', 'executive'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveTemplate(t);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[12px] font-bold cursor-pointer transition-colors ${
                        activeTemplate === t
                          ? 'bg-lavender-500 text-white'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {t === 'traditional' ? 'Traditional Serif' : t === 'modern' ? 'Modern Elegant' : t === 'minimalist' ? 'Minimalist' : t === 'tech' ? 'Tech Lead' : t === 'classic' ? 'Classic ATS' : 'Executive Chic'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 5))}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-bold select-none min-w-[32px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 5))}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        {/* Live A4 canvas wrapper container */}
        <div className="flex-1 overflow-auto p-6 md:p-8 flex items-start justify-center bg-[var(--bg-surface)] scrollbar-thin">
          <div
            id="printable-resume-container"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
            className="w-[210mm] min-h-[297mm] bg-white text-black p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.4)] border border-neutral-200 rounded-sm transition-transform duration-200 select-text flex flex-col font-sans"
          >
            {/* Template 6: Traditional Serif */}
            {activeTemplate === 'traditional' && (
              <div className="w-full flex flex-col h-full text-neutral-900 text-[12.5px] leading-relaxed font-serif">
                {/* Header (Centered, Serif) */}
                <div className="text-center pb-4 mb-4">
                  <h1 className="text-3xl font-normal tracking-wide text-neutral-900 mb-1 uppercase font-serif">
                    {data.personal.fullName || 'Your Name'}
                  </h1>
                  <p className="text-[12px] tracking-wider uppercase text-neutral-600 font-serif">
                    {data.personal.title || 'Professional Title'}
                  </p>
                </div>

                {/* Professional Summary (Full Width) */}
                {data.summary && (
                  <div className="mb-6">
                    <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-2 font-serif">
                      Professional Summary
                    </h2>
                    <p className="text-[12px] text-neutral-800 font-serif leading-relaxed text-justify">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* 2 Column Layout */}
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column (Contact, Education, Skills) - 4 cols */}
                  <div className="col-span-4 flex flex-col gap-6">
                    {/* Contact Section */}
                    <div>
                      <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-3 font-serif">
                        Contact
                      </h2>
                      <div className="space-y-2 text-[11.5px] text-neutral-800 font-sans">
                        {data.personal.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-serif">📞</span>
                            <span>{data.personal.phone}</span>
                          </div>
                        )}
                        {data.personal.email && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-serif">✉️</span>
                            <span className="text-blue-650 underline break-all">{data.personal.email}</span>
                          </div>
                        )}
                        {data.personal.website && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-serif">🌐</span>
                            <span className="text-blue-650 underline break-all">{data.personal.website}</span>
                          </div>
                        )}
                        {data.personal.linkedin && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-serif">🔗</span>
                            <span className="text-blue-650 underline break-all">{data.personal.linkedin}</span>
                          </div>
                        )}
                        {data.personal.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-600 font-serif">📍</span>
                            <span>{data.personal.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Education Section */}
                    {data.education.length > 0 && (
                      <div>
                        <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-3 font-serif">
                          Education
                        </h2>
                        <div className="space-y-3 font-serif">
                          {data.education.map((edu, i) => (
                            <div key={i} className="text-[12px]">
                              <div className="font-bold text-neutral-900 leading-snug">{edu.school}</div>
                              <div className="text-neutral-700 italic text-[11.5px]">{edu.degree} in {edu.field}</div>
                              <div className="text-neutral-505 text-[11px]">{edu.startDate} – {edu.endDate}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    {data.skills.length > 0 && (
                      <div>
                        <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-2 font-serif">
                          Skills
                        </h2>
                        <ul className="list-disc pl-4 space-y-1 text-[11.5px] text-neutral-800 font-serif">
                          {data.skills.map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Work Experience, Projects) - 8 cols */}
                  <div className="col-span-8 flex flex-col gap-6">
                    {/* Work Experience Section */}
                    {data.experience.length > 0 && (
                      <div>
                        <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-3 font-serif">
                          Work Experience
                        </h2>
                        <div className="space-y-4 font-serif">
                          {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[13px] text-neutral-900">{exp.company}</span>
                                <span className="text-[11.5px] text-neutral-600">{exp.startDate} – {exp.endDate}</span>
                              </div>
                              <div className="text-[12px] italic text-neutral-705">{exp.role}</div>
                              <p className="text-[12px] text-neutral-750 leading-relaxed text-justify whitespace-pre-line">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {data.projects.length > 0 && (
                      <div>
                        <h2 className="text-[12.5px] font-bold uppercase tracking-wide text-neutral-900 border-b border-neutral-300 pb-0.5 mb-3 font-serif">
                          Featured Projects
                        </h2>
                        <div className="space-y-4 font-serif">
                          {data.projects.map((proj, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-baseline">
                                <span className="font-bold text-[13px] text-neutral-900">{proj.title}</span>
                                {proj.link && <span className="text-[11.5px] text-blue-655 underline font-sans break-all">{proj.link}</span>}
                              </div>
                              {proj.technologies && (
                                <div className="text-[10.5px] text-neutral-500 font-sans italic">
                                  Technologies: {proj.technologies}
                                </div>
                              )}
                              <p className="text-[12px] text-neutral-750 leading-relaxed text-justify mt-1">
                                {proj.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template 1: Modern Elegant */}
            {activeTemplate === 'modern' && (
              <div className="w-full flex flex-col h-full text-neutral-800 text-[13px] leading-relaxed">
                {/* Header Banner */}
                <div className="pb-6 border-b-4 border-lavender-500/80 mb-6">
                  <h1 className="text-3xl font-black tracking-tight text-neutral-900 leading-none mb-1">
                    {data.personal.fullName || 'Your Name'}
                  </h1>
                  <p className="text-[14px] font-bold text-lavender-600 uppercase tracking-widest mb-3">
                    {data.personal.title || 'Professional Title'}
                  </p>
                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-neutral-500 font-medium">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                    {data.personal.website && <span>{data.personal.website}</span>}
                    {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
                  </div>
                </div>

                {/* 2 Column Layout details */}
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column (Metadata/Skills) */}
                  <div className="col-span-4 flex flex-col gap-6">
                    {data.summary && (
                      <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-lavender-600 mb-2">About Me</h2>
                        <p className="text-[11.5px] text-neutral-650 leading-relaxed font-medium">
                          {data.summary}
                        </p>
                      </div>
                    )}

                    {data.skills.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-lavender-600 mb-2.5">Skills</h2>
                        <div className="flex flex-wrap gap-1.5">
                          {data.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-0.8 bg-neutral-100 text-neutral-700 text-[10.5px] font-semibold rounded-md border border-neutral-200/50">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.languages.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-lavender-600 mb-2">Languages</h2>
                        <ul className="text-[11.5px] text-neutral-605 font-medium space-y-1">
                          {data.languages.map((lang, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                              <span>{lang}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Experience/Education) */}
                  <div className="col-span-8 flex flex-col gap-6">
                    {data.experience.length > 0 && (
                      <div>
                        <h2 className="text-[12px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1.5 mb-3">
                          Professional Experience
                        </h2>
                        <div className="space-y-4">
                          {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between items-start font-bold">
                                <div>
                                  <span className="text-[13px] text-neutral-900">{exp.role}</span>
                                  <span className="text-neutral-400 font-normal"> at </span>
                                  <span className="text-[13px] text-lavender-605 font-bold">{exp.company}</span>
                                </div>
                                <span className="text-[11px] text-neutral-505 font-medium shrink-0">{exp.startDate} – {exp.endDate}</span>
                              </div>
                              {exp.location && (
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{exp.location}</p>
                              )}
                              <p className="text-[11.5px] text-neutral-605 leading-relaxed font-medium whitespace-pre-line">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.projects.length > 0 && (
                      <div>
                        <h2 className="text-[12px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1.5 mb-3">
                          Featured Projects
                        </h2>
                        <div className="space-y-3">
                          {data.projects.map((proj, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-start font-bold">
                                <span className="text-[12.5px] text-neutral-900">{proj.title}</span>
                                {proj.link && <span className="text-[10.5px] text-neutral-400 font-mono font-normal">{proj.link}</span>}
                              </div>
                              {proj.technologies && (
                                <div className="text-[10px] text-lavender-605 font-bold uppercase tracking-wide">
                                  {proj.technologies}
                                </div>
                              )}
                              <p className="text-[11.5px] text-neutral-605 font-medium leading-relaxed">
                                {proj.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.education.length > 0 && (
                      <div>
                        <h2 className="text-[12px] font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1.5 mb-3">
                          Education
                        </h2>
                        <div className="space-y-3">
                          {data.education.map((edu, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-start font-bold">
                                <div>
                                  <span className="text-[13px] text-neutral-900">{edu.degree} in {edu.field}</span>
                                  <span className="text-neutral-400 font-normal">, </span>
                                  <span className="text-[12px] text-lavender-605 font-medium">{edu.school}</span>
                                </div>
                                <span className="text-[11px] text-neutral-505 font-medium shrink-0">{edu.startDate} – {edu.endDate}</span>
                              </div>
                              {edu.description && (
                                <p className="text-[11.5px] text-neutral-505 font-medium">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template 2: Minimalist (Universal) */}
            {activeTemplate === 'minimalist' && (
              <div className="w-full flex flex-col h-full text-neutral-805 text-[12.5px] leading-relaxed font-serif">
                {/* Header (Centered) */}
                <div className="text-center pb-6 border-b border-neutral-200 mb-6">
                  <h1 className="text-3xl font-normal tracking-wide text-neutral-900 mb-1 font-serif">
                    {data.personal.fullName || 'Your Name'}
                  </h1>
                  <p className="text-[12.5px] tracking-widest uppercase text-neutral-500 font-sans mb-3">
                    {data.personal.title || 'Professional Title'}
                  </p>
                  <div className="flex justify-center items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-neutral-600 font-sans">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>• {data.personal.phone}</span>}
                    {data.personal.location && <span>• {data.personal.location}</span>}
                    {data.personal.website && <span>• {data.personal.website}</span>}
                    {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
                  </div>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div className="mb-6">
                    <p className="text-[12px] text-neutral-605 text-center italic font-serif leading-relaxed px-4">
                      "{data.summary}"
                    </p>
                  </div>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[12.5px] font-sans font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold font-sans">
                            <span className="text-[12.5px] text-neutral-900">{exp.role} — <span className="font-normal italic">{exp.company}</span></span>
                            <span className="text-[11px] text-neutral-500 font-normal">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="flex justify-between text-[10.5px] text-neutral-400 font-sans italic">
                            <span>{exp.location}</span>
                          </div>
                          <p className="text-[12px] text-neutral-605 font-serif leading-relaxed whitespace-pre-line mt-1">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[12.5px] font-sans font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                      Projects
                    </h2>
                    <div className="space-y-4">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline font-sans font-bold">
                            <span className="text-[12.5px] text-neutral-900">{proj.title}</span>
                            {proj.link && <span className="text-[11px] text-neutral-505 font-normal font-sans">{proj.link}</span>}
                          </div>
                          {proj.technologies && (
                            <p className="text-[10px] text-neutral-505 font-sans tracking-wide">
                              Tech: {proj.technologies}
                            </p>
                          )}
                          <p className="text-[12px] text-neutral-655 font-serif leading-relaxed mt-1">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[12.5px] font-sans font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {data.education.map((edu, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold font-sans">
                            <span className="text-[12.5px] text-neutral-900">{edu.school}</span>
                            <span className="text-[11px] text-neutral-505 font-normal">{edu.startDate} – {edu.endDate}</span>
                          </div>
                          <p className="text-[12px] text-neutral-605 font-serif">
                            {edu.degree} in {edu.field} {edu.description && `• ${edu.description}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Grid */}
                {data.skills.length > 0 && (
                  <div>
                    <h2 className="text-[12.5px] font-sans font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
                      Skills & Expertise
                    </h2>
                    <p className="text-[12px] text-neutral-605 font-serif leading-relaxed">
                      {data.skills.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Template 3: Tech Lead (Designed) */}
            {activeTemplate === 'tech' && (
              <div className="w-full flex flex-col h-full text-neutral-805 text-[13px] leading-relaxed font-mono">
                {/* Header (Left Aligned, Modern Blocks) */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-neutral-800 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-955 mb-1">
                      {data.personal.fullName || 'Your Name'}
                    </h1>
                    <p className="text-[13.5px] text-neutral-605 font-bold uppercase tracking-wider">
                      &gt; {data.personal.title || 'Professional Title'}
                    </p>
                  </div>
                  <div className="text-right text-[10.5px] text-neutral-550 space-y-0.5 font-sans">
                    {data.personal.email && <div>email: {data.personal.email}</div>}
                    {data.personal.phone && <div>phone: {data.personal.phone}</div>}
                    {data.personal.location && <div>loc: {data.personal.location}</div>}
                    {data.personal.website && <div>web: {data.personal.website}</div>}
                    {data.personal.linkedin && <div>in: {data.personal.linkedin}</div>}
                  </div>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div className="mb-6 p-3 bg-neutral-50 border-l-4 border-neutral-750 font-sans text-[11.5px] text-neutral-655">
                    <div className="font-mono text-[10px] font-bold text-neutral-855 uppercase tracking-widest mb-1">$ cat about_me.txt</div>
                    {data.summary}
                  </div>
                )}

                {/* Skills Container */}
                {data.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[11.5px] font-bold text-neutral-955 uppercase tracking-wider mb-2.5">
                      // Core Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-neutral-900 text-neutral-100 text-[10.5px] font-semibold rounded font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {data.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[11.5px] font-bold text-neutral-955 uppercase tracking-wider mb-3">
                      // Experience History
                    </h2>
                    <div className="space-y-4 font-sans">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="relative pl-4 border-l border-neutral-300">
                          <div className="absolute w-2 h-2 rounded-full bg-neutral-905 -left-[4.5px] top-[5px]" />
                          <div className="flex flex-col md:flex-row md:justify-between md:items-baseline font-mono font-bold text-neutral-950 text-[12.5px]">
                            <span>{exp.role} <span className="text-neutral-555 font-normal">@</span> {exp.company}</span>
                            <span className="text-[10.5px] text-neutral-505 font-normal font-sans">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-[12px] text-neutral-605 mt-1.5 whitespace-pre-line leading-relaxed font-sans font-medium">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-[11.5px] font-bold text-neutral-955 uppercase tracking-wider mb-3">
                      // Repositories & Builds
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="p-3 border border-neutral-200 rounded bg-neutral-50 font-sans">
                          <div className="flex justify-between items-baseline font-mono font-bold text-neutral-900 text-[12px] mb-1">
                            <span>{proj.title}</span>
                          </div>
                          {proj.link && <div className="text-[10px] text-neutral-400 font-mono mb-1">{proj.link}</div>}
                          {proj.technologies && (
                            <div className="text-[9.5px] font-mono text-neutral-500 font-bold mb-1.5 uppercase">
                              [{proj.technologies}]
                            </div>
                          )}
                          <p className="text-[11.5px] text-neutral-605 font-medium leading-normal">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                  <div>
                    <h2 className="text-[11.5px] font-bold text-neutral-955 uppercase tracking-wider mb-2.5">
                      // Academic Credentials
                    </h2>
                    <div className="space-y-2 font-sans">
                      {data.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline font-mono">
                          <span className="text-[12px] font-bold text-neutral-900">{edu.degree} in {edu.field} — {edu.school}</span>
                          <span className="text-[10.5px] text-neutral-505 font-normal font-sans">{edu.startDate} – {edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template 4: Classic Corporate (Universal) */}
            {activeTemplate === 'classic' && (
              <div className="w-full flex flex-col h-full text-neutral-900 text-[12px] leading-relaxed font-sans">
                {/* Header (Professional Centralized Row) */}
                <div className="text-center pb-4 mb-4">
                  <h1 className="text-2xl font-bold tracking-tight uppercase text-neutral-900 mb-0.5">
                    {data.personal.fullName || 'Your Name'}
                  </h1>
                  <div className="flex justify-center items-center gap-x-2 gap-y-0.5 flex-wrap text-[11px] text-neutral-600 font-medium">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>| {data.personal.phone}</span>}
                    {data.personal.location && <span>| {data.personal.location}</span>}
                    {data.personal.website && <span>| {data.personal.website}</span>}
                    {data.personal.linkedin && <span>| {data.personal.linkedin}</span>}
                  </div>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div className="mb-4">
                    <p className="text-[11.5px] text-neutral-705 leading-relaxed font-medium">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-0.5 mb-2.5">
                      Professional Experience
                    </h2>
                    <div className="space-y-3.5">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline font-bold text-[12px]">
                            <span>{exp.company} <span className="font-normal italic">({exp.location})</span></span>
                            <span className="text-[11px] font-medium text-neutral-500">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <div className="text-[11.5px] italic text-neutral-705 font-semibold">{exp.role}</div>
                          <p className="text-[11.5px] text-neutral-605 leading-relaxed font-medium whitespace-pre-line mt-1">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-0.5 mb-2.5">
                      Technical Projects
                    </h2>
                    <div className="space-y-3">
                      {data.projects.map((proj, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-[12px]">
                            <span>{proj.title} {proj.role && <span className="font-normal italic text-neutral-500">— {proj.role}</span>}</span>
                            {proj.link && <span className="text-[11px] font-normal text-neutral-500 font-mono">{proj.link}</span>}
                          </div>
                          {proj.technologies && (
                            <div className="text-[10px] text-neutral-600 italic">
                              Technologies: {proj.technologies}
                            </div>
                          )}
                          <p className="text-[11.5px] text-neutral-605 font-medium leading-relaxed">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-0.5 mb-2.5">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-baseline font-bold text-[12px]">
                            <span>{edu.school} <span className="font-normal italic">({edu.location})</span></span>
                            <span className="text-[11px] font-medium text-neutral-500">{edu.startDate} – {edu.endDate}</span>
                          </div>
                          <p className="text-[11.5px] text-neutral-755 font-semibold">
                            {edu.degree} in {edu.field} {edu.description && <span className="font-normal text-neutral-505">| {edu.description}</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                  <div>
                    <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-0.5 mb-2">
                      Technical Skills
                    </h2>
                    <p className="text-[11.5px] text-neutral-755 font-medium">
                      {data.skills.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Template 5: Executive Chic (Designed) */}
            {activeTemplate === 'executive' && (
              <div className="w-full flex flex-col h-full text-neutral-800 text-[12.5px] leading-relaxed font-sans">
                {/* Header (Top Accent Banner Block) */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end pb-5 mb-5 border-b-2 border-indigo-700">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 uppercase">
                      {data.personal.fullName || 'Your Name'}
                    </h1>
                    <p className="text-[13px] font-bold text-indigo-650 uppercase tracking-widest">
                      {data.personal.title || 'Professional Title'}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end text-[11px] text-neutral-500 font-medium mt-3 md:mt-0">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>{data.personal.phone}</span>}
                    {data.personal.location && <span>{data.personal.location}</span>}
                    {data.personal.website && <span className="text-indigo-600">{data.personal.website}</span>}
                  </div>
                </div>

                {/* Core Columns */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Main (8 cols) */}
                  <div className="col-span-8 space-y-5">
                    {data.summary && (
                      <div>
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 mb-2 border-l-4 border-indigo-600 pl-2">
                          Executive Profile
                        </h2>
                        <p className="text-[12px] text-neutral-605 font-medium">
                          {data.summary}
                        </p>
                      </div>
                    )}

                    {data.experience.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 mb-3 border-l-4 border-indigo-600 pl-2">
                          Professional History
                        </h2>
                        <div className="space-y-4">
                          {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-baseline font-bold text-neutral-900 text-[12.5px]">
                                <span>{exp.role}</span>
                                <span className="text-[10.5px] font-medium text-neutral-500">{exp.startDate} - {exp.endDate}</span>
                              </div>
                              <div className="text-[11px] font-semibold text-indigo-600">{exp.company} • {exp.location}</div>
                              <p className="text-[11.5px] text-neutral-605 font-medium leading-relaxed whitespace-pre-line mt-1">
                                {exp.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar (4 cols) */}
                  <div className="col-span-4 space-y-5">
                    {data.skills.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 mb-2.5 border-l-4 border-indigo-600 pl-2">
                          Key Expertise
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                          {data.skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-750 text-[10.5px] font-bold rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.projects.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 mb-2 border-l-4 border-indigo-600 pl-2">
                          Key Projects
                        </h2>
                        <div className="space-y-3">
                          {data.projects.map((proj, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="font-bold text-[12px] text-neutral-900">{proj.title}</div>
                              {proj.link && <div className="text-[9.5px] text-neutral-400 font-mono truncate">{proj.link}</div>}
                              <p className="text-[11.5px] text-neutral-605 font-medium leading-normal mt-0.5">
                                {proj.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.education.length > 0 && (
                      <div>
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-900 mb-2 border-l-4 border-indigo-600 pl-2">
                          Education
                        </h2>
                        <div className="space-y-3">
                          {data.education.map((edu, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="font-bold text-[12px] text-neutral-955">{edu.school}</div>
                              <div className="text-[11px] text-neutral-500 font-medium">{edu.startDate} - {edu.endDate}</div>
                              <p className="text-[11.5px] text-neutral-605 font-semibold">
                                {edu.degree} in {edu.field}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
