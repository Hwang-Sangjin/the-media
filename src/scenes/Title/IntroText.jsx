/**
 * 영화 인트로 스타일의 텍스트 — 페이드인 → 유지 → 페이드아웃
 *
 * @param {string} text - 표시할 텍스트
 * @param {number} startTime - 페이지 진입 후 등장 시작 시각 (ms)
 * @param {number} elapsed - 페이지 진입 후 경과 시간 (ms)
 * @param {number} fadeIn - 페이드인 지속시간 (ms)
 * @param {number} hold - 표시 유지 시간 (ms)
 * @param {number} fadeOut - 페이드아웃 지속시간 (ms)
 * @param {string} className - 추가 스타일 클래스
 */
export default function IntroText({
  text,
  startTime,
  elapsed,
  fadeIn = 1500,
  hold = 1500,
  fadeOut = 1500,
  className = "",
}) {
  // 현재 텍스트의 진행 시간 (이 텍스트가 시작된 이후 경과 시간)
  const localElapsed = elapsed - startTime;

  // 아직 시작 전
  if (localElapsed < 0) return null;

  // 페이드아웃 끝나면 안 보임
  if (localElapsed > fadeIn + hold + fadeOut) return null;

  // 단계별 opacity 계산
  let opacity = 0;
  if (localElapsed < fadeIn) {
    // 페이드인 중
    opacity = localElapsed / fadeIn;
  } else if (localElapsed < fadeIn + hold) {
    // 유지 중
    opacity = 1;
  } else {
    // 페이드아웃 중
    opacity = 1 - (localElapsed - fadeIn - hold) / fadeOut;
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <p className="font-cormorant font-light text-white text-3xl md:text-6xl tracking-[0.15em] text-center">
        {text}
      </p>
    </div>
  );
}
