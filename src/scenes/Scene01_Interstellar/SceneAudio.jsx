import { useEffect, useRef } from "react";

export default function SceneAudio({ src, volume = 0.7, autoPlay = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (autoPlay) {
      audio.play().catch((err) => {
        console.warn("🔇 Audio autoplay blocked:", err.message);
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src, volume, autoPlay]);

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      style={{ display: "none" }}
    />
  );
}
