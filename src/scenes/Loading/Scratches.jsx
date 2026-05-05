import { useEffect, useState } from "react";

/**
 * 동적 스크래치 — 가끔 등장하는 세로선
 *
 * 한 번에 1~3개의 선이 무작위 위치에 짧게 등장했다가 사라짐.
 * 다음 등장까지 무작위 간격.
 */
export default function Scratches() {
  const [scratches, setScratches] = useState([]);

  useEffect(() => {
    let timeoutId;

    const spawn = () => {
      // 한 번에 1~3개 생성
      const count = 1 + Math.floor(Math.random() * 3);
      const newScratches = Array.from({ length: count }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        x: Math.random() * 100, // 가로 위치 (%)
        opacity: 0.15 + Math.random() * 0.25,
        width: 0.5 + Math.random() * 1.5, // px
        duration: 80 + Math.random() * 200, // 등장 지속시간 (ms)
        offsetY: Math.random() * 30 - 15, // 살짝의 세로 오프셋
        height: 60 + Math.random() * 40, // 선 길이 (vh 기준)
      }));

      setScratches(newScratches);

      // 짧은 시간 후 제거
      const maxDuration = Math.max(...newScratches.map((s) => s.duration));
      setTimeout(() => {
        setScratches([]);
      }, maxDuration);

      // 다음 등장까지 무작위 대기 (0.5초 ~ 4초)
      const nextDelay = 500 + Math.random() * 3500;
      timeoutId = setTimeout(spawn, nextDelay);
    };

    // 첫 등장은 약간의 딜레이 후
    timeoutId = setTimeout(spawn, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {scratches.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.offsetY}%`,
            width: `${s.width}px`,
            height: `${s.height}%`,
            background: `linear-gradient(180deg, transparent 0%, rgba(20, 15, 10, ${s.opacity}) 20%, rgba(20, 15, 10, ${s.opacity * 1.2}) 50%, rgba(20, 15, 10, ${s.opacity}) 80%, transparent 100%)`,
            mixBlendMode: "multiply",
            animation: `scratch-flicker ${s.duration}ms ease-out forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes scratch-flicker {
          0% { opacity: 0; }
          10% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
