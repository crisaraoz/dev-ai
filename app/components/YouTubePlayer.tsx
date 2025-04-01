import React, { useEffect, useRef, useState } from 'react';

interface YouTubePlayerProps {
  videoUrl: string | null;
  onTimeUpdate?: (currentTime: number) => void;
  seekTo?: number; // Nueva prop para controlar la posición del video
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl, onTimeUpdate, seekTo }) => {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const previousSeekRef = useRef<number | undefined>(undefined);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
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
    if (!videoUrl) return;
    
    const newVideoId = getVideoId(videoUrl);
    if (newVideoId !== currentVideoId) {
      console.log(`Video URL changed from ${currentVideoId} to ${newVideoId}`);
      setCurrentVideoId(newVideoId);
      setPlayerReady(false);
      
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
      console.log(`Seeking to ${seekTo} seconds`);
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
        console.log("Esperando a que YouTube API esté lista...");
        setTimeout(checkYTAndCreatePlayer, 100);
        return;
      }
      
      console.log("Creando reproductor para video ID:", videoId);
      
      try {
        playerRef.current = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              console.log("Reproductor listo");
              setPlayerReady(true);
              
              // Si hay un seekTo pendiente, aplicarlo ahora
              if (seekTo !== undefined) {
                console.log(`Aplicando seekTo pendiente a ${seekTo} segundos`);
                try {
                  event.target.seekTo(seekTo, true);
                  previousSeekRef.current = seekTo;
                } catch (error) {
                  console.error("Error al aplicar seekTo pendiente:", error);
                }
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
              console.error("Error en el reproductor de YouTube:", event.data);
            }
          }
        });
      } catch (error) {
        console.error("Error al crear el reproductor:", error);
        // Fallback a simulación de tiempo
        startTimeSimulation();
      }
    };
    
    // Iniciar el proceso de creación del reproductor
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
          if (typeof currentTime === 'number') {
            onTimeUpdate?.(currentTime);
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
          onTimeUpdate(currentTime);
        }
      }, 100); // Actualizar cada 100ms para mayor precisión
      
      return () => {
        clearInterval(timeUpdateInterval);
      };
    }
  }, [playerRef.current]);
  
  // Eventos del player
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    console.log('YouTube Player Ready:', event);
    playerRef.current = event.target;
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    console.log('YouTube Player State Change:', event.data);
    // Actualizar el tiempo cuando cambia el estado (reproducción, pausa, etc.)
    if (event.data === 1) { // 1 = reproduciendo
      const currentTime = event.target.getCurrentTime();
      onTimeUpdate(currentTime);
    }
  };

  const onPlayerPlay: YouTubeProps['onPlay'] = (event) => {
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

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">{'</>'}</div>
        <h2 className="text-2xl font-semibold mb-2">Welcome to AI Dev Tools</h2>
        <p className="text-muted-foreground">
          Write your code or question to start the conversation, or drag & drop a YouTube URL here for transcription.
        </p>
      </div>
    );
  }

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
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

export default YouTubePlayer; 