import React from 'react';

interface YouTubePlayerProps {
  videoUrl: string | null;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoUrl }) => {
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

  // Extract video ID from URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

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
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTubePlayer; 