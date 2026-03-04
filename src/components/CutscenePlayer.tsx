import React, { useState, useEffect, useRef } from 'react';
import { SkipForward, Play } from 'lucide-react';

const VERTICAL_VIDEOS = [
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJA1MwGk8dSD8EADEtA1oKbAgTQmltKQJLGAUdNjsZIj8MBBshDW0RIHw0bH5UVGgvEAoqN2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4",
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJOVMwGk0NNzElHCoCPCQxaisjYTtydQphKSwbNjsZPAUMBBshDW0RIHw4cB9MZmAHFQI8P2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4",
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJNFMwGkoKO2EHIh4pLTskEzE9AC5-HAp-Bho_KjsZP0UMBBshDW0RIHxuaigVXSIEGi5XL2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4"
];

const HORIZONTAL_VIDEOS = [
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJN1MwGko3CAk2NyZxKSxdPDhWBnRNHzhZAjIYcTsZPCcMBBshDW0RIHwsWgc2ZQcjFnwpN2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4",
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJNVMwGks_KD88ARwSLzkOEmQKXz1Za1lYZwktNjsZP1oMBBshDW0RIHw8GDMABx8-MC4IK2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4",
  "https://file.pro-talk.ru/tgf/GgMpJwQ9JCkYKglyGHQJMFMwGksdCTYhClwfCBoQCWQ6UxdkFgBDGWZOLjsZPwUMBBshDW0RIHwDbDM4aAsmLHMSN2QqJTkmVVpuYlYEbAV1VAgQCjEWKxseGVMpKyRYNBcXUm4FNwJgOi4UAQ4SOS4tKzsGCyUuTwJgBHdVAGB-S3U.mp4"
];

interface CutscenePlayerProps {
  onComplete: () => void;
}

export const CutscenePlayer: React.FC<CutscenePlayerProps> = ({ onComplete }) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isPortrait = window.innerHeight > window.innerWidth;
    const videos = isPortrait ? VERTICAL_VIDEOS : HORIZONTAL_VIDEOS;
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    setVideoUrl(randomVideo);
  }, []);

  useEffect(() => {
    // Fallback: if video doesn't trigger onCanPlay within 2 seconds (e.g. due to mobile data saving or autoplay blocking),
    // show the interaction button.
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setNeedsInteraction(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleCanPlay = () => {
    setIsLoading(false);
    if (videoRef.current) {
      // Check if user has interacted to avoid browser console error
      const hasInteracted = 
        (navigator as any).userActivation ? (navigator as any).userActivation.hasBeenActive : true;

      if (!hasInteracted) {
        setNeedsInteraction(true);
        return;
      }

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setNeedsInteraction(true);
        });
      }
    }
  };

  const handleManualPlay = () => {
    setNeedsInteraction(false);
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore manual play errors
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {isLoading && !needsInteraction && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-neutral-950 overflow-hidden">
          {/* Fog Background */}
          <div 
            className="absolute top-0 left-0 w-[200%] h-full opacity-30 animate-fog pointer-events-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: '50% 100%',
              backgroundRepeat: 'repeat-x',
              filter: 'grayscale(100%) contrast(150%) brightness(0.5)',
            }}
          />
          
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] z-10" />

          {/* Content */}
          <div className="relative z-20 flex flex-col items-center">
            <img 
              src="https://i.ibb.co/BVgY7XrT/babai.png" 
              alt="Babai Logo" 
              className="w-48 h-48 object-contain mb-8 drop-shadow-[0_0_25px_rgba(220,38,38,0.6)] animate-pulse"
              referrerPolicy="no-referrer"
            />
            
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-red-900/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            <p className="text-red-500 font-black tracking-[0.3em] uppercase text-sm drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse">
              Загрузка...
            </p>
          </div>
        </div>
      )}

      {needsInteraction && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
          <button
            onClick={handleManualPlay}
            className="bg-red-600 hover:bg-red-500 text-white rounded-full p-6 transition-transform hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
          >
            <Play size={48} fill="currentColor" className="ml-2" />
          </button>
          <p className="text-white font-bold mt-6 tracking-widest uppercase animate-pulse">Нажмите чтобы начать</p>
        </div>
      )}
      
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          onCanPlay={handleCanPlay}
          onEnded={onComplete}
          playsInline
          preload="auto"
          muted={false}
        />
      )}

      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-20 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors border border-white/10"
      >
        <span>Пропустить</span>
        <SkipForward size={16} />
      </button>
    </div>
  );
};
