# OpenMind AI - Local Uncensored AI Assistant

OpenMind is a premium, full-stack, local uncensored AI assistant and productivity platform built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and MongoDB. 

Featuring zero safety filters, a dark-mode styled layout, conversation persistence, and local workflow pipelines, OpenMind brings powerful, unrestricted AI tools straight to your local hardware.

---

## Simple Setup Guide (For Non-Technical Users)

Follow these 4 simple steps to get OpenMind up and running on your computer.

### Step 1: Install Node.js
Node.js is the engine that runs the application interface.
1. Go to the [Node.js Download Page](https://nodejs.org/).
2. Download the **LTS** version (Recommended for Most Users) for your operating system (Mac or Windows).
3. Open the downloaded file and follow the standard installation prompts (just click Next/Agree).

### Step 2: Install and Open Ollama
Ollama is what runs the AI models locally on your computer.
1. Go to [Ollama.com](https://ollama.com/) and download the application for Mac or Windows.
2. Install it like any regular application, then open it.
3. Once running, open your computer's terminal (search for "Terminal" on Mac or "Command Prompt" on Windows) and run this command to download the default model:
   ```bash
   ollama pull qwen3
   ```
   *(You can also download other models like `ollama pull llama3.2` or your own custom trained models).*

### Step 3: Set up MongoDB (Database)
MongoDB stores your chat history and files privately on your computer.
*   **On macOS:** If you have Homebrew installed, open terminal and run:
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
    ```
*   **On Windows:** Go to the [MongoDB Community Server Download Page](https://www.mongodb.com/try/download/community), download the installer, and follow the setup wizard (make sure "Run service as Network Service user" is checked).

### Step 4: Run the Application
1. Download this project folder to your computer.
2. Open your Terminal (Mac) or Command Prompt (Windows).
3. Type `cd ` (with a space after it) and drag-and-drop the downloaded project folder from your files into the terminal window, then press **Enter**.
4. Run this command to install the application dependencies:
   ```bash
   npm install
   ```
5. Copy the `.env.example` file in the folder, rename it to `.env.local`, and save it.
6. Run this command to start the app:
   ```bash
   npm run dev
   ```
7. Open your web browser and go to: **[http://localhost:3000](http://localhost:3000)**. You are ready to chat!

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

## Technical Installation Details

### Configure environment variables
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

---

## Model Fine-Tuning (Evasion Training)

If you find that standard prompted models are still flagged by Turnitin, you can fine-tune a model parameters-level using our scratch script:

1. Copy the training script in scratch/train_humanizer.py to a Google Colab notebook.
2. Select a T4 GPU runtime.
3. Install the dependencies and run the script to pull the dmitva/human_ai_generated_text dataset from Hugging Face and train Llama-3-8B.
4. Download the generated .gguf file.
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

## Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to help improve OpenMind.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
