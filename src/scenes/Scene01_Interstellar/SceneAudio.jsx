import { useEffect, useRef } from "react";

/**
 * Scene 1 의 오디오 재생
 *
 * 브라우저 자동 재생 정책 때문에 — 사용자가 페이지에서 한 번이라도
 * 인터랙션(클릭/스크롤/키보드) 한 적이 있어야 자동 재생이 허용돼요.
 * Title 화면의 WATCH 버튼 클릭이 그 인터랙션이라 Scene 1 진입 시에는
 * 자동 재생이 작동해요.
 */
export default function SceneAudio({ src, volume = 0.7, autoPlay = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (autoPlay) {
      audio.play().catch((err) => {
        // 자동 재생 차단 시 — 콘솔 경고만 출력
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
