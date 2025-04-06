# AI Dev Tools **Development Under Construction**

AI Dev Tools is an interactive web application that helps developers with code refactoring, test generation, code explanation, YouTube video transcription/summarization, and documentation assistance through an AI-powered interface.

## Demo Screenshots

Here are some screenshots of the YouTube transcription and summarization feature:

### YouTube Video Transcription and Summarization

![YouTube Feature Screenshot 1](/public/images/dark_youtube1.png)
*YouTube video transcription interface with timestamps*

![YouTube Feature Screenshot 2](/public/images/dark_youtube2.png)
*Video analysis with synchronized transcript*

![YouTube Feature Screenshot 3](/public/images/dark_youtube3.png)
*Detailed transcription with interactive controls*

![YouTube Feature Screenshot 4](/public/images/dark_youtube4.png)
*AI-powered summary of video content*

## Running the Complete Application Locally

This application consists of two parts: a Python backend (FastAPI) and a Next.js frontend. Follow these steps to run the complete application locally:

### Step 1: Start the Backend

The backend requires both the FastAPI server and the Qwen API proxy to be running:

```bash
# Navigate to the frontend directory (which contains the start script)
cd C:\Users\LENOVO\OneDrive\Escritorio\FrontEnd\devAI-tool

# Run the startup script that launches both services
.\start-backend.ps1
```

This script will:
- Start the Qwen API proxy in a new window
- Start the FastAPI server (with hot-reload enabled)
- Make the backend API available at http://127.0.0.1:8000

### Step 2: Start the Frontend

In a new terminal window:

```bash
# Navigate to the frontend directory
cd C:\Users\LENOVO\OneDrive\Escritorio\FrontEnd\devAI-tool

# Start the Next.js development server
npm run dev
```

### Step 3: Access the Application

Open your browser and go to [http://localhost:3000](http://localhost:3000) to use the application.

### Troubleshooting

If you encounter issues with the video summarization functionality:

1. Check that both backend services are running
2. Test the backend API directly:
   ```bash
   cd C:\Users\LENOVO\OneDrive\Escritorio\FrontEnd\devAI-tool
   node test-summary-api.mjs
   ```
3. Verify network connections: make sure ports 8000 and 3000 are not blocked by firewalls

## Features

### Code Assistant
- **Code Refactoring**: Improve your code structure and readability with AI suggestions
- **Test Generation**: Automatically generate unit, integration, or E2E tests for your code
- **Code Explanation**: Get detailed explanations of code at different experience levels
- **Multiple Programming Languages**: Support for JavaScript, TypeScript, Python, Java, C#, and more

### YouTube Resumer
- **Video Transcription**: Automatically generate transcripts from YouTube videos
- **Time-Stamped Content**: Navigate through video content with clickable timestamps
- **Auto-Scroll**: Follow along with the video as it plays with automatic transcript scrolling
- **Copy & Download**: Easily save or share video transcriptions

### Documentation Assistant
- **Ask Questions**: Interact with technical documentation using natural language
- **Document Processing**: Upload and analyze technical documents for quick reference
- **Contextual Answers**: Get specific answers from documentation content

### General Features
- **Conversation History**: Access previous conversations with a ChatGPT-like sidebar
- **Customizable Experience**: Adjust explanation detail based on developer experience level
- **Fullscreen Mode**: Focus on content with a distraction-free fullscreen view
- **Dark/Light Theme**: Choose your preferred visual theme
- **Copy & Download**: Easily copy or download generated content

## Technologies Used

- **Next.js** - React framework for building the web application
- **React** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Component library for consistent design
- **Lucide React** - SVG icon library

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devAI-tool.git
   cd devAI-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

### Code Assistant

1. **Select Language & Experience Level**: Choose your programming language and desired explanation detail level.

2. **Enter Code**: Type or paste your code in the input area.

3. **Choose Operation**: Select one of the available operations:
   - Refactor: Improve code structure and readability
   - Generate Tests: Create test cases for your code
   - Explain: Get detailed explanation of how your code works

4. **Process Code**: Click the "Process" button or use Ctrl+Enter to submit your code.

### YouTube Resumer

1. **Paste a YouTube URL**: Enter a YouTube video URL in the input field or drag and drop the URL.

2. **View Transcription**: The tool automatically generates a transcription with timestamps.

3. **Navigate Content**: Click on timestamps to jump to specific parts of the video.

4. **Auto-Scroll Option**: Toggle auto-scroll to follow along with the video playback.

5. **Summarize Content**: Get AI-generated summaries of the video content.

### Documentation Assistant

1. **Ask Questions**: Type questions about technical documentation.

2. **Upload Documentation**: Provide technical documents for context.

3. **Get Answers**: Receive precise answers extracted from the documentation.

## Project Structure

```
app/
├── components/         # UI components
│   ├── CodeBlock.tsx          # Code display component
│   ├── ExplanationBlock.tsx   # Formatted explanation component
│   ├── Footer.tsx             # Application footer
│   ├── Header.tsx             # Application header component
│   ├── InputArea.tsx          # Code input area component
│   ├── LanguageSelector.tsx   # Language selection component
│   ├── MessageHistory.tsx     # Chat history component
│   ├── ResultsArea.tsx        # Results display component
│   ├── Sidebar.tsx            # Sidebar navigation component
│   ├── YouTubePlayer.tsx      # YouTube video player
│   ├── YoutubeResume.tsx      # YouTube transcription component
│   ├── SelectItemWithDescription.tsx  # Enhanced selection component
│   ├── constants.ts           # Application constants
│   └── utils.tsx              # Utility functions
├── page.tsx            # Main application page
└── components/         # Shared UI components
    └── DocumentProcessor.tsx  # Documentation handling component
```

## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- YouTube API integration for video processing
