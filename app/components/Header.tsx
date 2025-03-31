import React from "react";
import { Button } from "@/components/ui/button";
import { Code2, Sun, Moon } from "lucide-react";

interface HeaderProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  return (
    <header className="border-b relative z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 ml-8 md:ml-0">
          <Code2 className="h-6 w-6" />
          AI Dev Tools
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default Header; 