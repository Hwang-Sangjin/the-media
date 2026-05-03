export default function FilmGrain() {
  return (
    <>
      {/* 노이즈 그레인 - SVG turbulence 필터 사용 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* 비네팅 - 가장자리 어둡게 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* 가끔씩 지나가는 스크래치 라인 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, transparent 30%, rgba(255,255,255,0.05) 30.5%, transparent 31%, transparent 70%, rgba(255,255,255,0.03) 70.3%, transparent 70.5%)",
          animation: "scratch-flicker 0.3s steps(2) infinite",
        }}
      />

      <style>{`
        @keyframes scratch-flicker {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
