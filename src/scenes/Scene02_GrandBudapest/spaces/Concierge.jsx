export default function Concierge() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #c4564f 0%, #8a3a3a 100%)",
      }}
    >
      {/* CONCIERGE 텍스트 */}
      <div className="absolute top-16 font-serif text-white text-4xl tracking-[0.4em]">
        CONCIERGE
      </div>

      {/* 카운터 placeholder */}
      <div
        className="relative w-[600px] h-[300px] flex items-end justify-around"
        style={{ background: "#b8896e", borderTop: "4px solid #d4a577" }}
      >
        {/* 캐릭터 placeholder들 */}
        <div className="w-16 h-32 bg-purple-900/80 mb-0" />
        <div className="w-16 h-32 bg-purple-900/80 mb-0" />
        <div className="w-16 h-36 bg-purple-900/80 mb-0" />
      </div>

      <div className="absolute bottom-8 font-mono text-white/80 text-xs tracking-widest">
        HOTEL FRONT
      </div>
    </div>
  );
}
