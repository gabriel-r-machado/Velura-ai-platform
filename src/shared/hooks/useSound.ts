import { useCallback } from 'react';

type SoundType = 'send' | 'receive' | 'success' | 'click' | 'toggle';

export const useSound = () => {
  const play = useCallback((type: SoundType) => {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const sounds: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
      send: { freq: 800, duration: 0.1, type: 'sine' },
      receive: { freq: 600, duration: 0.15, type: 'sine' },
      success: { freq: 1000, duration: 0.2, type: 'sine' },
      click: { freq: 400, duration: 0.05, type: 'square' },
      toggle: { freq: 500, duration: 0.08, type: 'triangle' },
    };

    const sound = sounds[type];
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + sound.duration);
  }, []);

  return { play };
};
