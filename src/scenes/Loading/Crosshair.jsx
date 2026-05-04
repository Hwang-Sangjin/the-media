export default function Crosshair() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      {/* 가로 선 — 화면 정중앙 수평 */}
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="rgba(40, 30, 25, 0.55)"
        strokeWidth="1.5"
      />

      {/* 세로 선 — 화면 정중앙 수직 */}
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="100%"
        stroke="rgba(40, 30, 25, 0.55)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
