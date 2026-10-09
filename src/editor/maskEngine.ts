import type { Stroke } from './types';

/**
 * Douglas-Peucker line simplification to reduce point count while preserving curve fidelity.
 */
export function simplifyPoints(
  points: [number, number][],
  tolerance = 0.003
): [number, number][] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const [firstX, firstY] = points[0];
  const [lastX, lastY] = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i];
    const dist = perpendicularDistance(px, py, firstX, firstY, lastX, lastY);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPoints(points.slice(0, index + 1), tolerance);
    const right = simplifyPoints(points.slice(index), tolerance);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function perpendicularDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Draws a single normalized stroke onto a 2D mask canvas context.
 */
export function drawStroke(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  s: Stroke,
  w: number,
  h: number
): void {
  if (!s.points || s.points.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = s.mode === 'erase' ? 'destination-out' : 'source-over';
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';

  const blurAmount = (1 - s.hardness) * s.size * w * 0.5;
  if (blurAmount > 0.5) {
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = blurAmount;
  } else {
    ctx.shadowBlur = 0;
  }

  if (s.shape === 'brush') {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1, s.size * w);

    ctx.beginPath();
    s.points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x * w, y * h);
      } else {
        ctx.lineTo(x * w, y * h);
      }
    });

    // If single tap / single point, draw a dab
    if (s.points.length === 1) {
      ctx.lineTo(s.points[0][0] * w + 0.01, s.points[0][1] * h);
    }
    ctx.stroke();
  } else if (s.shape === 'rect') {
    const p1 = s.points[0];
    const p2 = s.points[s.points.length - 1];
    const minX = Math.min(p1[0], p2[0]) * w;
    const minY = Math.min(p1[1], p2[1]) * h;
    const rw = Math.abs(p2[0] - p1[0]) * w;
    const rh = Math.abs(p2[1] - p1[1]) * h;

    ctx.beginPath();
    ctx.rect(minX, minY, rw, rh);
    ctx.fill();
  } else if (s.shape === 'ellipse') {
    const p1 = s.points[0];
    const p2 = s.points[s.points.length - 1];
    const cx = ((p1[0] + p2[0]) / 2) * w;
    const cy = ((p1[1] + p2[1]) / 2) * h;
    const rx = (Math.abs(p2[0] - p1[0]) / 2) * w;
    const ry = (Math.abs(p2[1] - p1[1]) / 2) * h;

    if (rx > 0 && ry > 0) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (s.shape === 'lasso') {
    ctx.beginPath();
    s.points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x * w, y * h);
      } else {
        ctx.lineTo(x * w, y * h);
      }
    });
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Re-renders all strokes sequentially onto the target mask canvas.
 */
export function renderAllStrokes(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  strokes: Stroke[],
  w: number,
  h: number
): void {
  ctx.clearRect(0, 0, w, h);
  for (const stroke of strokes) {
    drawStroke(ctx, stroke, w, h);
  }
}

/**
 * Generates preset blackout strokes covering common celebrity recognition zones.
 * Presets return editable Stroke items so users can paint/erase afterwards.
 */
export function createPresetStrokes(
  preset: 'hairline' | 'beard' | 'eyes' | 'sides',
  hardness = 0.8
): Stroke[] {
  const id = `preset_${preset}_${Date.now()}`;
  switch (preset) {
    case 'hairline':
      // Blackout top 32% of image
      return [
        {
          id,
          mode: 'paint',
          shape: 'rect',
          size: 0.1,
          hardness,
          points: [
            [0, 0],
            [1, 0.32],
          ],
        },
      ];

    case 'beard':
      // Blackout bottom 32% of image
      return [
        {
          id,
          mode: 'paint',
          shape: 'rect',
          size: 0.1,
          hardness,
          points: [
            [0, 0.68],
            [1, 1],
          ],
        },
      ];

    case 'eyes':
      // Blackout horizontal eyes strip (32% to 54% height)
      return [
        {
          id,
          mode: 'paint',
          shape: 'rect',
          size: 0.1,
          hardness,
          points: [
            [0, 0.32],
            [1, 0.54],
          ],
        },
      ];

    case 'sides':
      // Blackout left side (hair/jaw) and right side
      return [
        {
          id: `${id}_l`,
          mode: 'paint',
          shape: 'rect',
          size: 0.1,
          hardness,
          points: [
            [0, 0],
            [0.24, 1],
          ],
        },
        {
          id: `${id}_r`,
          mode: 'paint',
          shape: 'rect',
          size: 0.1,
          hardness,
          points: [
            [0.76, 0],
            [1, 1],
          ],
        },
      ];

    default:
      return [];
  }
}
