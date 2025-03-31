# AI Dev Tools

AI Dev Tools is an interactive web application that helps developers with code refactoring, test generation, and code explanation through an AI-powered chat interface.

## Features

- **Code Refactoring**: Improve your code structure and readability with AI suggestions
- **Test Generation**: Automatically generate unit, integration, or E2E tests for your code
- **Code Explanation**: Get detailed explanations of code at different experience levels
- **Multiple Programming Languages**: Support for JavaScript, TypeScript, Python, Java, C#, and more
- **Conversation History**: Access previous conversations with a ChatGPT-like sidebar
- **Customizable Experience**: Adjust explanation detail based on developer experience level
- **Fullscreen Mode**: Focus on content with a distraction-free fullscreen view
- **Dark/Light Theme**: Choose your preferred visual theme
- **Copy & Download**: Easily copy or download generated code and explanations

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

1. **Select Language & Experience Level**: Choose your programming language and desired explanation detail level.

2. **Enter Code**: Type or paste your code in the input area.

3. **Choose Operation**: Select one of the available operations:
   - Refactor: Improve code structure and readability
   - Generate Tests: Create test cases for your code
   - Explain: Get detailed explanation of how your code works

4. **Process Code**: Click the "Process" button or use Ctrl+Enter to submit your code.

5. **View Results**: See the AI-generated response in the results area.

6. **Manage Conversations**: Use the sidebar to start new conversations or access previous ones.

## Project Structure

```
app/
├── components/         # UI components
│   ├── CodeBlock.tsx          # Code display component
│   ├── ExplanationBlock.tsx   # Formatted explanation component
│   ├── Header.tsx             # Application header component
│   ├── InputArea.tsx          # Code input area component
│   ├── LanguageSelector.tsx   # Language selection component
│   ├── MessageHistory.tsx     # Chat history component
│   ├── ResultsArea.tsx        # Results display component
│   ├── Sidebar.tsx            # Sidebar navigation component
│   ├── SelectItemWithDescription.tsx  # Enhanced selection component
│   ├── constants.ts           # Application constants
│   └── utils.tsx              # Utility functions
└── page.tsx            # Main application page
```

## License

[MIT](LICENSE)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
