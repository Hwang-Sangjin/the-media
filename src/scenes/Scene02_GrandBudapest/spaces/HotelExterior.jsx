export default function HotelExterior() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #f5d4d4 0%, #e8b4c8 100%)",
      }}
    >
      {/* 설산 배경 (placeholder) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #d4c5d8 100%)",
          clipPath:
            "polygon(0 60%, 15% 30%, 30% 50%, 50% 20%, 70% 45%, 85% 25%, 100% 55%, 100% 100%, 0 100%)",
        }}
      />

      {/* 호텔 건물 (placeholder) */}
      <div
        className="relative w-[500px] h-[400px] flex flex-col items-center"
        style={{
          background: "#f4a8c0",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div className="absolute top-4 font-serif text-white text-xl tracking-widest">
          GRAND BUDAPEST HOTEL
        </div>
        {/* 창문 격자 */}
        <div className="absolute inset-8 grid grid-cols-6 grid-rows-5 gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/40 border border-white/60 rounded-sm"
            />
          ))}
        </div>
      </div>

      {/* Stage 라벨 */}
      <div className="absolute bottom-8 font-mono text-white/80 text-xs tracking-widest">
        HOTEL EXTERIOR
      </div>
    </div>
  );
}
