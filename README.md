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

## Running the Complete Application Locally

This application consists of two parts: a Python backend (FastAPI) and a Next.js frontend. Follow these steps to run the complete application locally:

### Step 1: Start the Backend

The backend requires both the FastAPI server and the Qwen API proxy to be running:

```bash
# Navigate to the front directory (which contains the start script)
cd C:\Users\your-front-directory

# Run the startup script that start the Qwen api proxy (in my case im using this AI, it can be different for OpenAi or other AI model)
.\start_proxy.ps1

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
cd C:\Users\your-frontend-directory

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
   cd C:\Users\your-frontend-directory
   node test-summary-api.mjs
   ```
3. Verify network connections: make sure ports 8000 and 3000 are not blocked by firewalls


## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- YouTube API integration for video processing
