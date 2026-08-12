// ============================================================
// OpenMind — TypeScript Type Definitions
// ============================================================

// --- Database Models ---

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  provider?: 'credentials' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  _id: string;
  userId: string;
  title: string;
  model: string;
  archived: boolean;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: IAttachment[];
  model?: string;
  liked?: boolean | null;
  createdAt: Date;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface IAttachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface IFile {
  _id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType: string;
  createdAt: Date;
}

export interface ILibraryItem {
  _id: string;
  userId: string;
  title: string;
  content: string;
  type: 'prompt' | 'response' | 'research' | 'document' | 'conversation';
  folder?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettings {
  _id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  systemInstructions: string;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- AI Provider ---

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  contextLength?: number;
  available: boolean;
}

export interface AIProvider {
  name: string;
  chat(params: ChatRequest): Promise<ReadableStream<Uint8Array>>;
  listModels(): Promise<AIModel[]>;
  healthCheck(): Promise<boolean>;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

export interface ChatResponse {
  content: string;
  model: string;
  done: boolean;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// --- Deep Research ---

export type ResearchStepType =
  | 'planning'
  | 'searching'
  | 'analyzing'
  | 'synthesizing'
  | 'finalizing';

export interface ResearchStep {
  type: ResearchStepType;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  detail?: string;
}

export interface ResearchSource {
  title: string;
  url?: string;
  snippet: string;
}

export interface ResearchResult {
  answer: string;
  sources: ResearchSource[];
  steps: ResearchStep[];
}

// --- UI State ---

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

export interface ComposerState {
  text: string;
  isDeepResearch: boolean;
  attachments: File[];
  isSubmitting: boolean;
}

// --- API Responses ---

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// --- Suggestion Card ---

export interface SuggestionCard {
  icon: string;
  title: string;
  description: string;
  prompt: string;
}

// --- Explore Capability ---

export interface ExploreCapability {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  systemPrompt: string;
  examplePrompts: string[];
}

// --- Plans ---

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}
