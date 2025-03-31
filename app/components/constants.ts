export const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "/icons/languages/javascript.svg" },
  { value: "typescript", label: "TypeScript", icon: "/icons/languages/typescript.svg" },
  { value: "python", label: "Python", icon: "/icons/languages/python.svg" },
  { value: "java", label: "Java", icon: "/icons/languages/java.svg" },
  { value: "csharp", label: "C#", icon: "/icons/languages/csharp.svg" },
  { value: "cpp", label: "C++", icon: "/icons/languages/cpp.svg" },
  { value: "go", label: "Go", icon: "/icons/languages/go.svg" },
  { value: "rust", label: "Rust", icon: "/icons/languages/rust.svg" },
  { value: "php", label: "PHP", icon: "/icons/languages/php.svg" },
  { value: "ruby", label: "Ruby", icon: "/icons/languages/ruby.svg" },
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