import React from 'react';
import { Path, Group, Circle, Text as SkiaText, useFont } from '@shopify/react-native-skia';
import type { HexTile } from '@/types/game';
import type { Point } from '@/utils/hexMath';
import { hexCorners } from '@/utils/hexMath';
import { terrainColor, terrainBorderColor } from '@/utils/terrain';
import { Colors } from '@/theme';

interface HexCellProps {
  tile: HexTile;
  center: Point;
  size: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isReachable: boolean;
  playerColor: string | null;
}

function cornersToPath(corners: Point[]): string {
  return corners
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ') + ' Z';
}

export function HexCell({
  tile,
  center,
  size,
  isSelected,
  isHighlighted,
  isReachable,
  playerColor,
}: HexCellProps) {
  const corners = hexCorners(center, size - 1.5);
  const pathData = cornersToPath(corners);

  const fillColor = terrainColor(tile.terrain);
  const borderColor = isSelected
    ? Colors.primary.DEFAULT
    : isHighlighted
    ? Colors.warning
    : isReachable
    ? Colors.success
    : playerColor
    ? playerColor
    : terrainBorderColor(tile.terrain);

  const borderWidth = isSelected ? 2.5 : isHighlighted || isReachable ? 2 : 1.5;
  const glowOpacity = isSelected ? 0.4 : isHighlighted ? 0.25 : isReachable ? 0.2 : 0;

  return (
    <Group>
      {/* Glow layer */}
      {glowOpacity > 0 && (
        <Path
          path={cornersToPath(hexCorners(center, size + 4))}
          color={`${borderColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}`}
        />
      )}

      {/* Fill */}
      <Path path={pathData} color={fillColor} />

      {/* Owner tint */}
      {tile.ownerId && playerColor && (
        <Path
          path={pathData}
          color={`${playerColor}28`}
        />
      )}

      {/* Border */}
      <Path
        path={pathData}
        color={borderColor}
        style="stroke"
        strokeWidth={borderWidth}
      />

      {/* Unit dot */}
      {tile.unitId && (
        <Circle
          cx={center.x}
          cy={center.y}
          r={size * 0.28}
          color={playerColor ?? Colors.text.primary}
        />
      )}
    </Group>
  );
}
