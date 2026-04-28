/**
 * Преобразование координат между DOM-image и реальным VDI.
 *
 * Учитывает object-fit: contain (letterboxing), scale, devicePixelRatio
 * и текущий getBoundingClientRect — то есть работает корректно в любом
 * масштабе браузера.
 */

export interface FrameResolution {
  width: number;
  height: number;
}

export interface VdiPoint {
  x: number;
  y: number;
}

export interface DisplayedRect {
  /** Положение и размер видимого изображения (после object-fit: contain). */
  left: number;
  top: number;
  width: number;
  height: number;
}

interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function fitFrameIntoRect(rect: RectLike, frame: FrameResolution): DisplayedRect {
  const fw = frame.width || rect.width || 1;
  const fh = frame.height || rect.height || 1;
  if (rect.width <= 0 || rect.height <= 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }
  const containerAspect = rect.width / rect.height;
  const frameAspect = fw / fh;
  let width = rect.width;
  let height = rect.height;
  let left = rect.left;
  let top = rect.top;
  if (frameAspect > containerAspect) {
    height = rect.width / frameAspect;
    top = rect.top + (rect.height - height) / 2;
  } else {
    width = rect.height * frameAspect;
    left = rect.left + (rect.width - width) / 2;
  }
  return { left, top, width, height };
}

/**
 * Возвращает реальный прямоугольник, который занимает изображение внутри
 * элемента <img> с object-fit: contain. Если изображение ещё не загрузилось
 * (naturalWidth = 0), возвращает bounding rect целиком.
 */
export function getDisplayedRect(
  img: HTMLImageElement,
  frame: FrameResolution,
): DisplayedRect {
  const rect = img.getBoundingClientRect();
  const fw = frame.width || img.naturalWidth || rect.width || 1;
  const fh = frame.height || img.naturalHeight || rect.height || 1;
  return fitFrameIntoRect(rect, { width: fw, height: fh });
}

/**
 * Переводит точку клиента (clientX/clientY) в координаты VDI.
 * Возвращает null, если клик пришёлся на letterbox (вне изображения).
 */
export function mapClientPointToVdiCoords(
  clientX: number,
  clientY: number,
  img: HTMLImageElement,
  frame: FrameResolution,
): VdiPoint | null {
  const r = getDisplayedRect(img, frame);
  if (r.width <= 0 || r.height <= 0) return null;
  const localX = clientX - r.left;
  const localY = clientY - r.top;
  if (localX < 0 || localY < 0 || localX > r.width || localY > r.height) {
    return null;
  }
  const vdiX = (localX * frame.width) / r.width;
  const vdiY = (localY * frame.height) / r.height;
  return {
    x: Math.round(clamp(vdiX, 0, frame.width - 1)),
    y: Math.round(clamp(vdiY, 0, frame.height - 1)),
  };
}

/** Маппинг прямоугольника из клиентских в VDI координаты. */
export function mapDragRectToVdiBBox(
  rect: { x1: number; y1: number; x2: number; y2: number },
  img: HTMLImageElement,
  frame: FrameResolution,
): { x: number; y: number; w: number; h: number } | null {
  const a = mapClientPointToVdiCoords(rect.x1, rect.y1, img, frame);
  const b = mapClientPointToVdiCoords(rect.x2, rect.y2, img, frame);
  if (!a || !b) return null;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
}

/** Обратное преобразование: VDI → screen point (clientX/clientY). */
export function mapVdiCoordsToScreenPoint(
  vdi: VdiPoint,
  img: HTMLImageElement,
  frame: FrameResolution,
): { clientX: number; clientY: number } {
  const r = getDisplayedRect(img, frame);
  const sx = r.width / frame.width;
  const sy = r.height / frame.height;
  return {
    clientX: r.left + vdi.x * sx,
    clientY: r.top + vdi.y * sy,
  };
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
