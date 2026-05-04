/**
 * 이미지 프리로드
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * 오디오 프리로드
 */
export function preloadAudio(src) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(src);
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
    audio.src = src;
  });
}

/**
 * 여러 에셋을 병렬로 로드. 진행률 콜백 호출
 *
 * @param {Array<{type: 'image'|'audio', src: string}>} assets
 * @param {(progress: number) => void} onProgress - 0~1 사이 값
 */
export async function preloadAssets(assets, onProgress) {
  const total = assets.length;
  let loaded = 0;

  if (total === 0) {
    onProgress?.(1);
    return;
  }

  const promises = assets.map(async (asset) => {
    try {
      if (asset.type === "image") {
        await preloadImage(asset.src);
      } else if (asset.type === "audio") {
        await preloadAudio(asset.src);
      }
    } catch (err) {
      console.warn(err.message);
    } finally {
      loaded++;
      onProgress?.(loaded / total);
    }
  });

  await Promise.all(promises);
}
