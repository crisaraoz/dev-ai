import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-2 sm:py-3 border-t border-border bg-background sticky bottom-0">
      <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Developed by CrisAraoz
        </p>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:text-primary p-1 sm:p-2"
          >
            <a
              href="https://github.com/crisaraoz"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:text-primary p-1 sm:p-2"
          >
            <a
              href="https://linkedin.com/in/cris-araoz"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 