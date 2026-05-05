import { useEffect, useState } from "react";

export default function CountdownFrame({ number }) {
  const [isFlickering, setIsFlickering] = useState(false);

  // number가 바뀔 때마다 플리커 트리거
  useEffect(() => {
    setIsFlickering(true);
    const timer = setTimeout(() => {
      setIsFlickering(false);
    }, 100); // 플리커 지속 시간

    return () => clearTimeout(timer);
  }, [number]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "clamp(500px, 55vw, 900px)",
        height: "clamp(500px, 55vw, 900px)",
      }}
    >
      {/* 원형 가이드라인 — 두 개의 흰색 원 */}
      <svg
        viewBox="-250 -250 500 500"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 외곽 원 */}
        <circle
          cx="0"
          cy="0"
          r="230"
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="5"
        />

        {/* 내부 원 */}
        <circle
          cx="0"
          cy="0"
          r="210"
          fill="none"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="3"
        />
      </svg>

      {/* 큰 숫자 - 플리커 효과 */}
      <div
        key={number} // 숫자 바뀔 때마다 컴포넌트 리마운트 → 애니메이션 재시작
        className="relative font-bebas font-black select-none"
        style={{
          fontSize: "clamp(180px, 30vw, 500px)",
          lineHeight: 1,
          color: "#3a1a14",
          letterSpacing: "0",
          transform: "translateY(0.05em)",
          animation: isFlickering ? "number-flicker 280ms ease-out" : "none",
        }}
      >
        {number}
      </div>

      {/* 플리커 keyframe */}
      <style>{`
        @keyframes number-flicker {
          0% { opacity: 0; }
          15% { opacity: 1; }
          25% { opacity: 0.3; }
          35% { opacity: 1; }
          50% { opacity: 0.5; }
          65% { opacity: 1; }
          80% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
