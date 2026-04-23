import { Rect, Line, Circle } from 'react-konva'
import type { SnapResult } from '../../utils/snapEngine'

interface Props {
  snap: SnapResult | null
  zoom: number
}

const COLOR: Record<string, string> = {
  grid: '#60a5fa',
  endpoint: '#fbbf24',
  midpoint: '#34d399',
  intersection: '#f472b6',
}

export function SnapMarker({ snap, zoom }: Props) {
  if (!snap || snap.type === 'none') return null

  const { x, y } = snap.point
  const size = 10 / zoom
  const color = COLOR[snap.type] ?? '#ffffff'
  const strokeWidth = 1.5 / zoom

  if (snap.type === 'endpoint' || snap.type === 'grid') {
    return (
      <Rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        listening={false}
      />
    )
  }

  if (snap.type === 'midpoint') {
    return (
      <Line
        points={[x, y - size / 1.3, x - size / 1.3, y + size / 2, x + size / 1.3, y + size / 2]}
        closed
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        listening={false}
      />
    )
  }

  if (snap.type === 'intersection') {
    return (
      <>
        <Line
          points={[x - size / 2, y - size / 2, x + size / 2, y + size / 2]}
          stroke={color} strokeWidth={strokeWidth} listening={false}
        />
        <Line
          points={[x - size / 2, y + size / 2, x + size / 2, y - size / 2]}
          stroke={color} strokeWidth={strokeWidth} listening={false}
        />
        <Circle x={x} y={y} radius={size / 2} stroke={color} strokeWidth={strokeWidth} fill="transparent" listening={false} />
      </>
    )
  }

  return null
}
