export default function FilmPerforation() {
  // 위에서 아래로 일정 간격 구멍들
  const holes = Array.from({ length: 12 }, (_, i) => i);

  return (
    <>
      {/* 좌측 */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-black/40 flex flex-col justify-around py-4">
        {holes.map((i) => (
          <div
            key={`left-${i}`}
            className="mx-auto w-8 h-6 bg-black border border-white/20 rounded-sm"
          />
        ))}
      </div>

      {/* 우측 */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-black/40 flex flex-col justify-around py-4">
        {holes.map((i) => (
          <div
            key={`right-${i}`}
            className="mx-auto w-8 h-6 bg-black border border-white/20 rounded-sm"
          />
        ))}
      </div>
    </>
  );
}
