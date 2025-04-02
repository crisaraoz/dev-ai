import React from "react";
import { Button } from "@/components/ui/button";
import { Code2, Sun, Moon, BookOpen } from "lucide-react";
import Link from "next/link";

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
        <div className="flex items-center gap-2">
          {/* <Link href="/docs" passHref>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              title="API Documentation"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">API Docs</span>
            </Button>
          </Link> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 