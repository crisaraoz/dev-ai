/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoUrl: string | null;
  onTimeUpdate?: (currentTime: number) => void;
  seekTo?: number; // Nueva prop para controlar la posición del video
  isProcessing?: boolean; // Nueva prop para indicar si se está procesando el video
  onYouTubeUrl?: (url: string) => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl, onTimeUpdate, seekTo, isProcessing, onYouTubeUrl }) => {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const previousSeekRef = useRef<number | undefined>(undefined);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Sincronizar el estado de carga externo con el interno
  useEffect(() => {
    if (isProcessing !== undefined) {
      setIsLoading(isProcessing);
    }
  }, [isProcessing]);

  // Extract video ID from URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Cargar la API de YouTube
  useEffect(() => {
    // Si la API de YouTube ya está cargada, no hacer nada
    if (window.YT) return;
    
    // Función que se llamará cuando la API esté lista
    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API ready");
    };
    
    // Cargar el script de la API de YouTube
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    // Limpiar el intervalo cuando se desmonte el componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Efecto para detectar cambios en la URL del video
  useEffect(() => {
    // Cuando videoUrl es null, limpiamos todo el estado
    if (!videoUrl) {
      setCurrentVideoId(null);
      setPlayerReady(false);
      setIsLoading(false);
      
      // Destruir el reproductor si existe
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("Error al destruir el reproductor:", error);
        }
      }
      return;
    }
    
    const newVideoId = getVideoId(videoUrl);
    if (newVideoId !== currentVideoId) {
      setCurrentVideoId(newVideoId);
      setPlayerReady(false);
      setIsLoading(true);
      
      // Si el reproductor ya existe, destruirlo
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (error) {
          console.error("Error al destruir el reproductor:", error);
        }
      }
      
      // Inicializar el nuevo reproductor
      loadPlayer(newVideoId);
    }
  }, [videoUrl]);

  // Efecto para manejar los cambios en seekTo
  useEffect(() => {
    // Solo procesar si seekTo ha cambiado y el reproductor está listo
    if (seekTo !== undefined && seekTo !== previousSeekRef.current && playerReady && playerRef.current) {
      try {
        playerRef.current.seekTo(seekTo, true);
        previousSeekRef.current = seekTo;
      } catch (error) {
        console.error("Error al buscar posición en el video:", error);
      }
    }
  }, [seekTo, playerReady]);

  // Función para cargar el reproductor de YouTube
  const loadPlayer = (videoId: string | null) => {
    if (!videoId) return;
    
    // Esperar a que la API de YouTube esté lista
    const checkYTAndCreatePlayer = () => {
      if (!window.YT || !window.YT.Player) {
        setTimeout(checkYTAndCreatePlayer, 100);
        return;
      }
      try {
        // Reset existing player
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
            playerRef.current = null;
          } catch (error) {
            console.error("Error destroying existing player:", error);
          }
        }
        
        // Get player container
        const playerContainer = document.getElementById('youtube-player');
        if (!playerContainer) {
          console.error("Player container not found!");
          return;
        }
        
        // Clear container and prepare it
        playerContainer.innerHTML = '';
        
        // Create new container for iframe
        const wrapper = document.createElement('div');
        wrapper.id = 'youtube-iframe-container';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'hidden';
        
        playerContainer.appendChild(wrapper);
        
        // Create new player with minimum config
        playerRef.current = new window.YT.Player('youtube-iframe-container', {
          videoId: videoId,
          playerVars: {
            controls: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              setIsLoading(false);
              
              if (seekTo !== undefined) {
                try {
                  event.target.seekTo(seekTo, true);
                  previousSeekRef.current = seekTo;
                } catch (error) {
                  console.error("Error seeking:", error);
                }
              }
              
              // Start playing now that we're ready
              try {
                event.target.playVideo();
              } catch (error) {
                console.error("Error playing video:", error);
              }
              
              // Apply custom styles to iframe after it's ready
              const iframe = document.querySelector('#youtube-iframe-container iframe');
              if (iframe && iframe instanceof HTMLIFrameElement) {
                iframe.style.position = 'absolute';
                iframe.style.top = '-1px';
                iframe.style.left = '-1px';
                iframe.style.width = 'calc(100% + 2px)';
                iframe.style.height = 'calc(100% + 2px)';
                iframe.style.border = 'none';
                iframe.style.margin = '0';
                iframe.style.padding = '0';
                iframe.style.transform = 'scale(1.02)';
                iframe.style.transformOrigin = 'center center';
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                startTimeUpdates();
              } else {
                stopTimeUpdates();
              }
            },
            onError: (event: any) => {
              console.error("Player error:", event.data);
              setIsLoading(false);
            }
          }
        });
      } catch (error) {
        console.error("Error creating player:", error);
        setIsLoading(false);
        startTimeSimulation();
      }
    };
    
    checkYTAndCreatePlayer();
  };

  const startTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerReady) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          if (typeof currentTime === 'number' && onTimeUpdate) {
            onTimeUpdate(currentTime);
          }
        } catch (error) {
          console.warn("Error al obtener tiempo de reproducción:", error);
        }
      }
    }, 500);
  };

  const stopTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Simulación de tiempo como fallback
  const startTimeSimulation = () => {
    if (videoUrl && onTimeUpdate) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      let currentTime = 0;
      intervalRef.current = setInterval(() => {
        currentTime += 1;
        onTimeUpdate(currentTime);
      }, 1000);
    }
  };

  useEffect(() => {
    // Cuando el reproductor está listo
    if (playerRef.current) {
      // Configurar un intervalo para actualizar el tiempo actual con más frecuencia
      const timeUpdateInterval = setInterval(() => {
        if (playerRef.current?.getCurrentTime && playerRef.current.getPlayerState() === 1) {
          const currentTime = playerRef.current.getCurrentTime();
          if (onTimeUpdate) {
            onTimeUpdate(currentTime);
          }
        }
      }, 100); // Actualizar cada 100ms para mayor precisión
      
      return () => {
        clearInterval(timeUpdateInterval);
      };
    }
  }, [playerRef.current]);
  
  // Eventos del player
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // Actualizar el tiempo cuando cambia el estado (reproducción, pausa, etc.)
    if (event.data === 1 && onTimeUpdate) { // 1 = reproduciendo
      const currentTime = event.target.getCurrentTime();
      onTimeUpdate(currentTime);
    }
  };

  const onPlayerPlay: YouTubeProps['onPlay'] = (event) => {
    if (!onTimeUpdate) return;
    
    const currentTime = event.target.getCurrentTime();
    onTimeUpdate(currentTime);
    // Iniciar el intervalo para actualizaciones frecuentes durante la reproducción
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    updateIntervalRef.current = setInterval(() => {
      const time = event.target.getCurrentTime();
      onTimeUpdate(time);
    }, 100); // Actualización cada 100ms
  };

  const onPlayerPause: YouTubeProps['onPause'] = () => {
    // Detener las actualizaciones frecuentes cuando se pausa
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  // Effect to adjust the YouTube iframe after it's loaded
  useEffect(() => {
    if (playerReady && !isLoading) {
      // Find the iframe and apply style fixes to remove black bars
      // The selector needs to target the iframe inside the youtube-iframe-container
      const iframe = document.querySelector('#youtube-iframe-container iframe');
      if (iframe && iframe instanceof HTMLIFrameElement) {
        iframe.style.display = 'block';
        iframe.style.maxWidth = '100%';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '-1px'; // Move slightly up to hide top border
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = 'calc(100% + 6px)'; // Add extra height to eliminate the bottom bar
        iframe.style.margin = '0';
        iframe.style.padding = '0';
        iframe.style.lineHeight = '0';
        iframe.style.verticalAlign = 'top';
        iframe.style.transform = 'scale(1.01)'; // Slightly scale up to hide borders
        iframe.style.transformOrigin = 'center center';
        
        // Fix parent container if needed
        const container = iframe.parentElement;
        if (container) {
          container.style.lineHeight = '0';
          container.style.fontSize = '0';
          container.style.margin = '0';
          container.style.padding = '0';
          container.style.overflow = 'hidden';
          container.style.height = '100%';
        }
      }
    }
  }, [playerReady, isLoading]);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[350px] md:min-h-[400px] text-center p-8">
        <div className="text-5xl sm:text-6xl mb-4 hover:text-primary transition-colors cursor-pointer" 
             onClick={() => document.querySelector('textarea')?.focus()}>
          {'</>'}
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Welcome to AI Dev Tools</h2>
        <div className="flex flex-col gap-4 items-center max-w-lg w-full">
          <button 
            onClick={() => document.querySelector('textarea')?.focus()}
            className="text-muted-foreground hover:text-primary transition-colors p-4 rounded-lg border-2 border-dashed hover:border-primary w-full"
          >
            Write your code or question to start the conversation
          </button>
          <div className="relative w-full">
            <div 
              className="text-muted-foreground hover:text-primary transition-colors p-4 rounded-lg border-2 border-dashed hover:border-primary cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-primary', 'text-primary');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-primary', 'text-primary');
              }}
              onDrop={(e) => {
                e.preventDefault();
                const text = e.dataTransfer.getData('text');
                if (text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
                  onYouTubeUrl?.(text);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text');
                if (text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
                  onYouTubeUrl?.(text);
                }
              }}
              tabIndex={0}
            >
              Drag & Drop or Copy your Youtube URL
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-red-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" style={{ paddingTop: 0 }}>
      <style jsx global>{`
        /* Force iframe to cover completely without any borders */
        #youtube-iframe-container iframe {
          position: absolute !important;
          top: -3px !important;
          left: -3px !important;
          width: calc(100% + 6px) !important;
          height: calc(100% + 6px) !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          transform: scale(1.03) !important;
          transform-origin: center center !important;
          box-sizing: content-box !important;
        }
        
        /* Hide any potential black bars */
        #youtube-player, 
        #youtube-iframe-container {
          overflow: hidden !important;
          background-color: black !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        /* Remove any bottom margin or padding */
        .ytp-chrome-bottom {
          bottom: -10px !important;
        }
      `}</style>
      {isLoading ? (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-background">
          <div className="animate-spin h-12 w-12 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Cargando video...</p>
        </div>
      ) : (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-black">
          <div id="youtube-player" className="absolute top-0 left-0 w-full h-full overflow-hidden bg-black"></div>
        </div>
      )}
    </div>
  );
};

// Agregar declaración global para TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Declare tipos para YouTube Player
interface YouTubeProps {
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
  onPlay: (event: any) => void;
  onPause: (event: any) => void;
}

export default YouTubePlayer; 