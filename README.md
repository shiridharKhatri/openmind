# OpenMind AI

OpenMind is a premium, full-stack, local AI assistant and productivity platform built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and MongoDB. 

Featuring zero safety filters, a dark-mode styled layout, conversation persistence, and local workflow pipelines, OpenMind brings powerful AI tools straight to your local hardware.

---

## Key Features

*   **Streaming AI Chat** - Token-by-token streaming responses with markdown support, code syntax highlighting, and dynamic context retrieval.
*   **Advanced Text Humanizer** - A dedicated bypass editor specifically designed to evade academic and corporate AI detectors (such as Turnitin, GPTZero, and Copyleaks).
    *   **Levels 1-10:** Vary the rewriting strength from light paraphrasing to deep semantic remodeling.
    *   **SVG Detection Gauge:** Real-time visual feedback showing human-likeness probability score.
    *   **Comparison Mode:** Highlight changed segments (green highlight) to compare the original and humanized versions side-by-side.
*   **ComfyUI Video Generation** - Local API connection to queue Stable Video Diffusion (SVD) workflows on a local ComfyUI instance (defaulting to port 8188) to generate AI videos.
*   **Local File RAG** - Upload files (PDF, TXT, DOCX, CSV, images) to index them and chat with your local documents.
*   **Fine-Tuning Integration** - Included python script to fine-tune your own local humanizer model on a GPU with Hugging Face datasets (dmitva/human_ai_generated_text) and Unsloth.

---

## Tech Stack

*   **Frontend:** Next.js 16 (App Router), React 19, Lucide Icons, React Markdown
*   **Styling:** Tailwind CSS v4 (Custom dark themes with lavender accent system)
*   **Database:** MongoDB + Mongoose (conversation and file history metadata)
*   **AI Engine:** Ollama (Runs local LLMs e.g., Llama 3, Qwen 3, Mistral)

---

## Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   Node.js (v18.17 or later)
*   MongoDB (running locally or a remote Atlas connection string)
*   Ollama (for loading and running LLMs)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/shiridharKhatri/openmind.git
cd openmind

# Install dependencies
npm install
```

### 3. Set up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/openmind

# Authentication
NEXTAUTH_SECRET=your-random-32-character-secret
NEXTAUTH_URL=http://localhost:3000

# Ollama Endpoint
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. Start the Application
```bash
# Start development server
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Model Fine-Tuning (Evasion Training)

If you find that standard prompted models are still flagged by Turnitin, you can fine-tune a model parameters-level using our scratch script:

1. Copy the training script in scratch/train_humanizer.py to a Google Colab notebook.
2. Select a T4 GPU runtime.
3. Install the dependencies and run the script to pull the dmitva/human_ai_generated_text dataset from Hugging Face and train Llama-3-8B.
4. Download the generated .gguf` file.
5. Create a Modelfile linking the .gguf file:
   ```dockerfile
   FROM ./humanizer_model-unsloth.Q4_K_M.gguf
   TEMPLATE """Below is an AI-generated text. Rewrite it to sound natural, organic, and written by an expert human, bypassing AI detectors.
   ### AI Text:
   {{ .Prompt }}
   ### Humanized Text:
   """
   PARAMETER temperature 0.85
   ```
6. Build and run it in Ollama:
   ```bash
   ollama create humanizer -f ./Modelfile
   ```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
