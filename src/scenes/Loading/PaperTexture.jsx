export default function PaperTexture() {
  return (
    <>
      {/* 베이스 색상 — 회색 톤의 빈티지 종이 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, #b8b4ad 0%, #908a82 60%, #4a4540 100%)",
        }}
      />

      {/* 종이 결 텍스처 — SVG turbulence */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-multiply opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="paperGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.25
                    0 0 0 0 0.22
                    0 0 0 0 0.20
                    0 0 0 0.5 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperGrain)" />
      </svg>

      {/* 추가 그레인 — 더 미세한 노이즈 */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="fineGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2.5"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#fineGrain)" />
      </svg>
    </>
  );
}
