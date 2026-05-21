import { useEffect, useRef } from "react";

const FADE_IN_DURATION = 800;
const FADE_OUT_DURATION = 1000;
const FADE_STEPS = 30;

function fadeVolume(audio, from, to, duration, fadeIntervalRef) {
  if (fadeIntervalRef.current) {
    clearInterval(fadeIntervalRef.current);
  }

  const startTime = Date.now();
  const diff = to - from;

  fadeIntervalRef.current = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    audio.volume = from + diff * eased;

    if (progress >= 1) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, duration / FADE_STEPS);
}

export default function SceneAudio({
  src,
  volume = 0.7,
  autoPlay = true,
  loop = false,
  delay = 0,
}) {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const playTimerRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn("🔇 audio element not found");
      return;
    }

    console.log("🎵 SceneAudio mounted:", src, "delay:", delay);

    audio.loop = loop;
    audio.volume = 0;

    // ✨ src 로드 명시적으로 트리거
    audio.load();

    if (autoPlay) {
      playTimerRef.current = setTimeout(() => {
        console.log("🎵 Attempting play:", src);

        audio
          .play()
          .then(() => {
            console.log("🎵 Playing:", src);
            fadeVolume(audio, 0, volume, FADE_IN_DURATION, fadeIntervalRef);
          })
          .catch((err) => {
            console.warn("🔇 Play failed:", src, err.message);
          });
      }, delay);
    }

    return () => {
      console.log("🎵 SceneAudio unmounted:", src);

      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const startVolume = audio.volume;
      if (startVolume > 0) {
        // 재생 중일 때만 페이드아웃
        const startTime = Date.now();
        const fadeOutInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / FADE_OUT_DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          audio.volume = startVolume * (1 - eased);

          if (progress >= 1) {
            clearInterval(fadeOutInterval);
            audio.pause();
            audio.currentTime = 0;
          }
        }, FADE_OUT_DURATION / FADE_STEPS);
      } else {
        // 아직 재생 안 됐으면 그냥 멈춤
        audio.pause();
        audio.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      style={{ display: "none" }}
    />
  );
}
