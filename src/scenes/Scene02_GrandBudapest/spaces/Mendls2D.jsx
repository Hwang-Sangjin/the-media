export default function Mendls2D() {
  // 핑크 박스들 격자 배치
  const boxes = Array.from({ length: 24 });

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #f8c8d8 0%, #e8a4b8 100%)",
      }}
    >
      {/* 박스 더미 */}
      <div className="grid grid-cols-6 gap-2 p-12">
        {boxes.map((_, i) => (
          <div
            key={i}
            className="w-20 h-16 flex items-center justify-center font-serif text-white/80 text-xs"
            style={{
              background: "#f4a8c0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              border: "2px solid #e88aa8",
              transform: `rotate(${((i * 7) % 6) - 3}deg)`,
            }}
          >
            MENDL'S
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 font-mono text-white/80 text-xs tracking-widest">
        MENDL'S
      </div>
    </div>
  );
}
