import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Trash2, X, User, LogOut, LayoutGrid } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  date: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversation,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation
}) => {
  const [hoverConversation, setHoverConversation] = useState<string | null>(null);
  const [hoverDelete, setHoverDelete] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    setDeleteDialog(false);
    setConversationToDelete(null);
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 w-[80%] sm:w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-14 sm:pt-16 pb-4">
          <div className="px-3 sm:px-4 mt-6">
            <Button 
              variant="default" 
              className="w-full mb-3 sm:mb-4 text-left flex items-center gap-2 justify-start text-xs sm:text-sm h-9 sm:h-10 bg-blue-500 hover:bg-blue-600 text-white" 
              onClick={onNewConversation}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              New Conversation
            </Button>
          </div>

          <div className="flex-1 overflow-auto px-3 sm:px-4">
            <div className="space-y-1.5 sm:space-y-2">
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  className="relative"
                  onMouseEnter={() => setHoverConversation(conv.id)}
                  onMouseLeave={() => setHoverConversation(null)}
                >
                  <button
                    className={`w-full text-left p-2 sm:p-3 rounded-lg flex items-center gap-2 transition-colors text-xs sm:text-sm ${
                      activeConversation === conv.id 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </button>
                  
                  {hoverConversation === conv.id && (
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 rounded-md transition-colors hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={(e) => handleDeleteClick(e, conv.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Login Section al final del sidebar - mostrar estado de sesión */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center px-3">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded w-full justify-start"
                  >
                    <User className="h-4 w-4" />
                    <span className="truncate max-w-[140px] text-gray-900 dark:text-white">{session.user.name || session.user.email}</span>
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
                className="text-gray-600 dark:text-gray-400 w-full justify-start"
                onClick={() => window.location.href = "/login"}
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para cerrar en móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={onClose}
        />
      )}

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-[90%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Conversation?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this conversation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)} className="text-gray-800 dark:text-gray-200">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar; 