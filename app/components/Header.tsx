import React from "react";
import { Button } from "@/components/ui/button";
import { Code2, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleFullscreen, isFullscreen }) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 ml-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Code2 className="h-6 w-6" />
            AI Dev Tools
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 