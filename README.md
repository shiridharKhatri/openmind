# Lycoris AI

A modern, full-stack AI assistant web application built with Next.js 15+, TypeScript, and Tailwind CSS. Features a clean lavender-accented UI, streaming AI responses via Ollama, conversation persistence with MongoDB, and a complete set of productivity tools.

## Features

- **Chat with AI** — Streaming token-by-token responses with markdown rendering
- **Multiple Models** — Dynamic model selection from your local Ollama instance
- **Deep Research** — Enhanced research mode for thorough analysis
- **File Management** — Upload, view, and analyze documents (PDF, TXT, DOCX, CSV, images)
- **Library** — Save and organize prompts, responses, and research
- **Conversation History** — Search, pin, archive, rename, and manage conversations
- **Dark & Light Mode** — Beautiful theme switching with system preference support
- **Responsive Design** — Desktop, tablet, and mobile layouts
- **Authentication** — Email/password and Google OAuth
- **Settings** — AI parameters, appearance, privacy controls

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth v5 (Auth.js)
- **AI Backend**: Ollama (local LLMs)
- **Icons**: Lucide React
- **Markdown**: react-markdown + remark-gfm + highlight.js

## Prerequisites

- **Node.js** 18.17 or later
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Ollama** — for running local AI models

## Installation

### 1. Clone and install

```bash
git clone <your-repo-url>
cd uncensored.ai
npm install
```

### 2. Set up MongoDB

**Option A: Local MongoDB**
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option B: MongoDB Atlas (free tier)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string

### 3. Set up Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Or on macOS
brew install ollama

# Start Ollama
ollama serve

# Pull a model (in another terminal)
ollama pull qwen3
```

You can pull additional models:
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
```

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Required
MONGODB_URI=mongodb://localhost:27017/lycoris-ai
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=http://localhost:3000

# Ollama
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (app)/           # Main app with sidebar layout
│   │   ├── chat/        # Chat pages
│   │   ├── explore/     # AI capabilities
│   │   ├── library/     # Saved items
│   │   ├── files/       # File management
│   │   ├── history/     # Conversation history
│   │   ├── settings/    # User settings
│   │   └── upgrade/     # Plans/pricing
│   └── api/             # API routes
│       ├── auth/        # Authentication
│       ├── chat/        # Streaming chat
│       ├── conversations/ # CRUD
│       ├── models/      # Ollama model list
│       ├── files/       # File upload
│       └── library/     # Library CRUD
├── components/
│   ├── chat/            # Chat UI components
│   └── layout/          # Sidebar, Header
├── lib/
│   ├── ai/              # AI provider abstraction
│   ├── hooks/           # React hooks
│   └── models/          # Mongoose schemas
├── providers/           # React context providers
└── types/               # TypeScript interfaces
```

## Adding Additional AI Providers

The application uses a provider abstraction pattern:

```typescript
// src/lib/ai/provider.ts
export function getProvider(name?: string): AIProviderInterface {
  switch (name) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'ollama':
    default:
      return new OllamaProvider();
  }
}
```

To add a new provider:

1. Create `src/lib/ai/your-provider.ts`
2. Implement the `AIProviderInterface`
3. Add the case to `getProvider()` in `provider.ts`
4. Add required API keys to `.env.local`

## Production Deployment

### Build
```bash
npm run build
npm start
```

### Vercel
```bash
npx vercel
```

Set environment variables in your Vercel dashboard. Note: Ollama must be accessible from your deployment environment.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New chat |
| `Cmd/Ctrl + K` | Search |
| `Cmd/Ctrl + Enter` | Send message |
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Escape` | Close modal/sidebar |

## License

MIT
