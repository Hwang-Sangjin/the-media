export default function CountdownFrame({ number }) {
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

      {/* 큰 숫자 */}
      <div
        className="relative font-bebas font-black select-none"
        style={{
          fontSize: "clamp(180px, 30vw, 500px)",
          lineHeight: 1,
          color: "#3a1a14",
          letterSpacing: "0",
          transform: "translateY(0.05em)", // 폰트 메트릭 보정
        }}
      >
        {number}
      </div>
    </div>
  );
}
