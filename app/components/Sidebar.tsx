import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, MessageSquare } from "lucide-react";

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
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  toggleSidebar,
  conversations,
  activeConversation,
  startNewConversation,
  selectConversation
}) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-gray-50 dark:bg-gray-900 w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-3 pt-12">
          <Button 
            variant="outline" 
            className="w-full mb-4 text-left flex items-center gap-2 justify-start rounded-md" 
            onClick={startNewConversation}
          >
            <Plus className="h-4 w-4" />
            Nueva conversación
          </Button>

          <div className="space-y-1 mt-4">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className={`w-full text-left p-3 rounded-md flex items-center gap-2 transition-colors ${activeConversation === conv.id ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => selectConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <div className="truncate">{conv.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón flotante para mostrar/ocultar sidebar (estilo ChatGPT) */}
      <div className="fixed top-3 left-3 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-sm bg-transparent dark:bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-800 p-0 w-8 h-8 flex items-center justify-center"
          title={sidebarOpen ? "Ocultar conversaciones" : "Ver conversaciones"}
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
    </>
  );
};

export default Sidebar; 