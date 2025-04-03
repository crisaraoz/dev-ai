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
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex justify-between items-center relative">
        <div className="absolute right-2 sm:right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 sm:p-2"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
        
        <div className="w-full flex justify-center items-center">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-1 sm:gap-2 text-gray-900 dark:text-white">
            <Code2 className="h-5 w-5 sm:h-6 sm:w-6" />
            AI Dev Tools
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header; 