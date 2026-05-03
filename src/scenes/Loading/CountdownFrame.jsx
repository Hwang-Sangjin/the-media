export default function CountdownFrame({ number }) {
  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      <svg
        viewBox="-200 -200 400 400"
        className="absolute inset-0 w-full h-full"
        style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.3))" }}
      >
        {/* 외곽 원 */}
        <circle
          cx="0"
          cy="0"
          r="180"
          fill="none"
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* 내부 원 */}
        <circle
          cx="0"
          cy="0"
          r="140"
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* 십자선 - 가로 */}
        <line
          x1="-200"
          y1="0"
          x2="200"
          y2="0"
          stroke="white"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* 십자선 - 세로 */}
        <line
          x1="0"
          y1="-200"
          x2="0"
          y2="200"
          stroke="white"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* 회전하는 와이퍼 (시계 침처럼 돌아감) */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-180"
          stroke="white"
          strokeWidth="3"
          opacity="0.9"
          style={{
            transformOrigin: "center",
            animation: "wiper-rotate 1s linear infinite",
          }}
        />
      </svg>

      {/* 큰 숫자 */}
      <div
        className="relative font-mono text-white font-bold"
        style={{ fontSize: "180px", lineHeight: 1 }}
      >
        {number}
      </div>

      {/* 와이퍼 회전 애니메이션 */}
      <style>{`
        @keyframes wiper-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
