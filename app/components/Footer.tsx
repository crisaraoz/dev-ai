import React from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Footer: React.FC = () => {
  const { data: session } = useSession();
  
  return (
    <footer className="w-full py-2 sm:py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black mt-auto">
      <div className="container mx-auto px-0 sm:px-2 flex justify-between items-center relative">
        {/* Botón de usuario/logout a la izquierda en la esquina */}
        <div className="pl-2">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded"
                >
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-[100px] text-gray-900 dark:text-white">{session.user.name || session.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer flex items-center gap-2 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              className="text-gray-600 dark:text-gray-400"
              onClick={() => window.location.href = "/login"}
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>

        {/* Texto centrado */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 absolute left-1/2 transform -translate-x-1/2">
          Dev by CrisAraoz
        </p>

        {/* Iconos sociales a la derecha */}
        <div className="flex items-center gap-1 sm:gap-2 pr-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full text-gray-600 dark:text-gray-400 hover:text-primary p-1 sm:p-2"
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
            className="rounded-full text-gray-600 dark:text-gray-400 hover:text-primary p-1 sm:p-2"
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