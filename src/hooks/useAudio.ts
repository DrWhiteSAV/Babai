import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const bgMusics = [
  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=dark-ambient-11430.mp3',
  'https://cdn.pixabay.com/download/audio/2022/10/25/audio_4f0c9044b7.mp3?filename=creepy-ambient-12278.mp3',
  'https://cdn.pixabay.com/download/audio/2022/11/22/audio_1c50c598d1.mp3?filename=horror-background-atmosphere-156462.mp3',
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=dark-ambient-horror-cinematic-halloween-11430.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=scary-forest-90162.mp3'
];

const menuMusic = 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc48af67b2.mp3?filename=ambient-piano-amp-strings-10711.mp3';

export const useAudio = (volume: number) => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    if (!clickAudioRef.current) {
      clickAudioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=click-124467.mp3');
    }
    if (!transitionAudioRef.current) {
      transitionAudioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=whoosh-6316.mp3');
    }

    const isGame = location.pathname === '/game';
    const currentSrc = audioRef.current.src;

    if (isGame) {
      const randomMusic = bgMusics[Math.floor(Math.random() * bgMusics.length)];
      if (!currentSrc.includes(randomMusic)) {
        audioRef.current.src = randomMusic;
        audioRef.current.play().catch(() => {});
      }
    } else {
      if (!currentSrc.includes(menuMusic)) {
        audioRef.current.src = menuMusic;
        audioRef.current.play().catch(() => {});
      }
    }

    // Lower background music volume so TTS is audible
    audioRef.current.volume = (volume / 100) * 0.2;
  }, [location.pathname, volume]);

  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener('click', handleInteraction);
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  const playClick = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.volume = volume / 100;
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
  };

  const playTransition = () => {
    if (transitionAudioRef.current) {
      transitionAudioRef.current.volume = volume / 100;
      transitionAudioRef.current.currentTime = 0;
      transitionAudioRef.current.play().catch(() => {});
    }
  };

  const playSound = (type: 'scream' | 'cat' | 'fear') => {
    const src = type === 'scream' 
      ? 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=scream-124467.mp3'
      : type === 'cat'
      ? 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=cat-meow-14536.mp3'
      : 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=heartbeat-124467.mp3';
    
    const audio = new Audio(src);
    audio.volume = volume / 100;
    audio.play().catch(() => {});
  };

  return { playClick, playTransition, playSound };
};
