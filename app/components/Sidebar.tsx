import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, MessageSquare, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  date: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  toggleSidebar,
  conversations,
  activeConversation,
  startNewConversation,
  selectConversation,
  deleteConversation
}) => {
  const [hoverConversation, setHoverConversation] = useState<string | null>(null);
  const [hoverDelete, setHoverDelete] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
    }
    setDeleteDialog(false);
    setConversationToDelete(null);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-gray-50 dark:bg-black w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3 pt-12">
          <Button 
            variant="outline" 
            className="w-full mb-4 text-left flex items-center gap-2 justify-start rounded-md" 
            onClick={startNewConversation}
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>

          <div className="space-y-1 mt-4">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                className="relative"
                onMouseEnter={() => setHoverConversation(conv.id)}
                onMouseLeave={() => setHoverConversation(null)}
              >
                <button
                  className={`w-full text-left p-3 rounded-md flex items-center gap-2 transition-colors ${activeConversation === conv.id ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <div className="truncate">{conv.title}</div>
                </button>
                
                {hoverConversation === conv.id && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors"
                    onMouseEnter={() => setHoverDelete(conv.id)}
                    onMouseLeave={() => setHoverDelete(null)}
                    onClick={(e) => handleDeleteClick(e, conv.id)}
                    style={{
                      backgroundColor: hoverDelete === conv.id ? 'rgba(220, 38, 38, 0.1)' : 'transparent'
                    }}
                  >
                    <Trash2 
                      className="h-4 w-4 flex-shrink-0" 
                      style={{
                        color: hoverDelete === conv.id ? 'rgb(220, 38, 38)' : 'currentColor'
                      }}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button for sidebar (as ChatGPT) */}
      <div className="fixed top-3 left-3 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-sm bg-transparent dark:bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-800 p-0 w-8 h-8 flex items-center justify-center"
          title={sidebarOpen ? "Hide chats" : "Show chats"}
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay para cerrar sidebar en móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Conversation?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to delete this conversation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
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