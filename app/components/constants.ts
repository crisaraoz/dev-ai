export const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
];

export const TEST_FRAMEWORKS = {
  javascript: ["Jest", "Mocha", "Jasmine"],
  typescript: ["Jest", "Vitest", "AVA"],
  python: ["Pytest", "Unittest", "Nose"],
  java: ["JUnit", "TestNG", "Mockito"],
  csharp: ["NUnit", "xUnit", "MSTest"],
  cpp: ["Google Test", "Catch2", "Boost.Test"],
  go: ["Go Test", "Testify", "GoCheck"],
  rust: ["Built-in Tests", "Tokio Test", "Proptest"],
  php: ["PHPUnit", "Codeception", "Pest"],
  ruby: ["RSpec", "Minitest", "Test::Unit"],
};

export const EXPLANATION_LEVELS = [
  {
    value: "junior",
    label: "Junior Developer",
    description: "Detailed explanations with basic concepts and examples"
  },
  {
    value: "mid",
    label: "Mid-Level Developer",
    description: "Balanced explanations focusing on implementation details and best practices"
  },
  {
    value: "senior",
    label: "Senior Developer",
    description: "Advanced concepts, architecture patterns, and performance considerations"
  }
]; 