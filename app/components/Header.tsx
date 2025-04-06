import React from "react";
import { Button } from "@/components/ui/button";
import { Code2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

interface HeaderProps {
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const Header: React.FC<HeaderProps> = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="flex justify-between items-center w-full px-4 py-2 sm:py-4">
        <div className="w-10"></div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-1 sm:gap-2 text-gray-900 dark:text-white">
            <Code2 className="h-5 w-5 sm:h-6 sm:w-6" />
            AI Dev Tools
          </h1>
        </div>
        
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 sm:p-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 