import { useEffect, useRef } from "react";

const FADE_IN_DURATION = 800;
const FADE_OUT_DURATION = 1000;
const FADE_STEPS = 30;

export default function SceneAudio({
  src,
  volume = 0.7,
  autoPlay = true,
  loop = false,
  delay = 0, // ← 재생 시작 전 딜레이 (ms)
}) {
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const playTimerRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = loop;
    audio.volume = 0;

    if (autoPlay) {
      // delay 후 재생 시작
      playTimerRef.current = setTimeout(() => {
        audio
          .play()
          .then(() => {
            fadeVolume(audio, 0, volume, FADE_IN_DURATION);
          })
          .catch((err) => {
            console.warn("🔇 Audio autoplay blocked:", err.message);
          });
      }, delay);
    }

    return () => {
      // 재생 예약 취소
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }

      // 진행 중인 페이드 정리
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      // 페이드아웃 후 pause
      const startVolume = audio.volume;
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const fadeVolume = (audio, from, to, duration) => {
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
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      style={{ display: "none" }}
    />
  );
}
