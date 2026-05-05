export default function SweepOverlay() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,0,0,0.25) 0deg, rgba(0,0,0,0.25) var(--sweep-angle), transparent var(--sweep-angle), transparent 360deg)",
          animation: "sweep-rotate 1s linear infinite",
        }}
      />

      <style>{`
        @property --sweep-angle {
          syntax: '<angle>';
          inherits: false;
          initial-value: 0deg;
        }

        @keyframes sweep-rotate {
          from {
            --sweep-angle: 0deg;
          }
          to {
            --sweep-angle: 360deg;
          }
        }
      `}</style>
    </>
  );
}
