export default function Train() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #5a4a3a 0%, #3a2a1f 100%)",
      }}
    >
      {/* 기차 객실 인테리어 */}
      <div
        className="relative w-[700px] h-[400px] flex items-center justify-around"
        style={{ background: "#7a5a3a", border: "8px solid #5a3a2a" }}
      >
        {/* 창문 (밖 풍경) */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-64 h-32"
          style={{
            background: "linear-gradient(180deg, #c8d4e8 0%, #e8d4c8 100%)",
            border: "4px solid #5a3a2a",
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-white/40" />
        </div>

        {/* 좌석 + 캐릭터 */}
        <div className="w-20 h-40 bg-purple-900/80 mt-16" />
        <div className="w-20 h-40 bg-purple-900/80 mt-16" />
      </div>

      <div className="absolute bottom-8 font-mono text-white/80 text-xs tracking-widest">
        TRAIN
      </div>
    </div>
  );
}
