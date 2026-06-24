import type { HexCoord } from '@/types/game';

// ─── Cube Coordinate Fundamentals ────────────────────────────────────────────

export function hexKey(c: HexCoord): string {
  return `${c.q},${c.r},${c.s}`;
}

export function hexFromKey(key: string): HexCoord {
  const [q, r, s] = key.split(',').map(Number);
  return { q, r, s };
}

export function hexEqual(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r && a.s === b.s;
}

export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
}

export function hexSubtract(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q - b.q, r: a.r - b.r, s: a.s - b.s };
}

export function hexScale(c: HexCoord, factor: number): HexCoord {
  return { q: c.q * factor, r: c.r * factor, s: c.s * factor };
}

export function hexLength(c: HexCoord): number {
  return Math.max(Math.abs(c.q), Math.abs(c.r), Math.abs(c.s));
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return hexLength(hexSubtract(a, b));
}

// ─── Directions ───────────────────────────────────────────────────────────────

const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0, s: -1 },
  { q: 1, r: -1, s: 0 },
  { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 },
  { q: -1, r: 1, s: 0 },
  { q: 0, r: 1, s: -1 },
];

export function hexDirection(dir: 0 | 1 | 2 | 3 | 4 | 5): HexCoord {
  return HEX_DIRECTIONS[dir];
}

export function hexNeighbor(c: HexCoord, dir: 0 | 1 | 2 | 3 | 4 | 5): HexCoord {
  return hexAdd(c, HEX_DIRECTIONS[dir]);
}

export function hexNeighbors(c: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map((d) => hexAdd(c, d));
}

// ─── Range & Ring ─────────────────────────────────────────────────────────────

export function hexRange(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      results.push({ q: center.q + q, r: center.r + r, s: center.s - q - r });
    }
  }
  return results;
}

export function hexRing(center: HexCoord, radius: number): HexCoord[] {
  if (radius === 0) return [center];
  const results: HexCoord[] = [];
  let current = hexAdd(center, hexScale(HEX_DIRECTIONS[4], radius));
  for (let dir = 0; dir < 6; dir++) {
    for (let step = 0; step < radius; step++) {
      results.push(current);
      current = hexNeighbor(current, dir as 0 | 1 | 2 | 3 | 4 | 5);
    }
  }
  return results;
}

// ─── Pixel Conversion (flat-top layout) ──────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export function hexToPixel(c: HexCoord, size: number, origin: Point = { x: 0, y: 0 }): Point {
  const x = size * (3 / 2) * c.q + origin.x;
  const y = size * ((Math.sqrt(3) / 2) * c.q + Math.sqrt(3) * c.r) + origin.y;
  return { x, y };
}

export function pixelToHex(p: Point, size: number, origin: Point = { x: 0, y: 0 }): HexCoord {
  const px = (p.x - origin.x) / size;
  const py = (p.y - origin.y) / size;
  const q = (2 / 3) * px;
  const r = (-1 / 3) * px + (Math.sqrt(3) / 3) * py;
  return hexRound({ q, r, s: -q - r });
}

export function hexRound(c: { q: number; r: number; s: number }): HexCoord {
  let q = Math.round(c.q);
  let r = Math.round(c.r);
  let s = Math.round(c.s);

  const dq = Math.abs(q - c.q);
  const dr = Math.abs(r - c.r);
  const ds = Math.abs(s - c.s);

  if (dq > dr && dq > ds) {
    q = -r - s;
  } else if (dr > ds) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  return { q, r, s };
}

// ─── Corner Pixel Positions (flat-top) ────────────────────────────────────────

export function hexCorners(center: Point, size: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i);
    return {
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    };
  });
}

// ─── Line of Sight ────────────────────────────────────────────────────────────

function hexLerp(a: HexCoord, b: HexCoord, t: number): { q: number; r: number; s: number } {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t,
  };
}

export function hexLine(a: HexCoord, b: HexCoord): HexCoord[] {
  const n = hexDistance(a, b);
  if (n === 0) return [a];
  return Array.from({ length: n + 1 }, (_, i) =>
    hexRound(hexLerp(a, b, i / n))
  );
}

// ─── Pathfinding (BFS — respects passable tiles) ─────────────────────────────

export function hexBFS(
  start: HexCoord,
  maxRange: number,
  isPassable: (c: HexCoord) => boolean
): Set<string> {
  const visited = new Set<string>();
  const frontier: Array<{ coord: HexCoord; steps: number }> = [{ coord: start, steps: 0 }];
  visited.add(hexKey(start));

  while (frontier.length > 0) {
    const current = frontier.shift()!;
    if (current.steps >= maxRange) continue;

    for (const neighbor of hexNeighbors(current.coord)) {
      const key = hexKey(neighbor);
      if (!visited.has(key) && isPassable(neighbor)) {
        visited.add(key);
        frontier.push({ coord: neighbor, steps: current.steps + 1 });
      }
    }
  }

  visited.delete(hexKey(start));
  return visited;
}

// ─── Board Generation ─────────────────────────────────────────────────────────

export type BoardSize = 'small' | 'medium' | 'large';
const BOARD_RADIUS: Record<BoardSize, number> = { small: 3, medium: 5, large: 7 };

export function generateBoardCoords(size: BoardSize): HexCoord[] {
  return hexRange({ q: 0, r: 0, s: 0 }, BOARD_RADIUS[size]);
}
