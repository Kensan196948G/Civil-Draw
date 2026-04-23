import { Line, Rect, Circle, Text, Arrow } from 'react-konva'
import type { Shape } from '../../types/geometry'
import type { Layer } from '../../types/layer'

interface Props {
  shape: Shape
  layer: Layer | undefined
  isSelected: boolean
  onSelect: (id: string) => void
  isPreview?: boolean
}

const DASH_PATTERNS: Record<string, number[]> = {
  solid: [],
  dashed: [10, 5],
  dashdot: [10, 5, 2, 5],
}

export function ShapeRenderer({ shape, layer, isSelected, onSelect, isPreview = false }: Props) {
  const color = isPreview ? '#888888' : (layer?.color ?? '#000000')
  const lineWidth = layer?.lineWidth ?? 1
  const dash = DASH_PATTERNS[layer?.lineStyle ?? 'solid']
  const strokeWidth = isSelected ? lineWidth + 1 : lineWidth
  const shadowBlur = isSelected ? 4 : 0

  const handleClick = () => { if (!isPreview) onSelect(shape.id) }

  const commonProps = {
    stroke: color,
    strokeWidth,
    dash,
    shadowBlur,
    shadowColor: '#4af',
    opacity: isPreview ? 0.6 : 1,
    onClick: handleClick,
    listening: !isPreview,
  }

  switch (shape.type) {
    case 'line':
      return (
        <Line
          {...commonProps}
          points={[shape.x1, shape.y1, shape.x2, shape.y2]}
        />
      )
    case 'rect':
      return (
        <Rect
          {...commonProps}
          x={shape.x} y={shape.y}
          width={shape.width} height={shape.height}
          rotation={shape.rotation}
          fill="transparent"
        />
      )
    case 'circle':
      return (
        <Circle
          {...commonProps}
          x={shape.cx} y={shape.cy}
          radius={shape.radius}
          fill="transparent"
        />
      )
    case 'polyline':
      return (
        <Line
          {...commonProps}
          points={shape.points}
          closed={shape.closed}
          fill={shape.closed ? color + '22' : 'transparent'}
        />
      )
    case 'text':
      return (
        <Text
          x={shape.x} y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize}
          rotation={shape.rotation}
          fill={color}
          opacity={isPreview ? 0.6 : 1}
          onClick={handleClick}
          listening={!isPreview}
        />
      )
    case 'dimension': {
      const { x1, y1, x2, y2, offset, textHeight, arrowSize, orientation } = shape
      let lx1 = x1, ly1 = y1, lx2 = x2, ly2 = y2
      let tx = 0, ty = 0
      let dimText = ''

      if (orientation === 'horizontal') {
        ly1 = y1 - offset
        ly2 = y2 - offset
        tx = (x1 + x2) / 2
        ty = Math.min(y1, y2) - offset - textHeight - 4
        dimText = Math.abs(x2 - x1).toFixed(1)
      } else if (orientation === 'vertical') {
        lx1 = x1 - offset
        lx2 = x2 - offset
        tx = Math.min(x1, x2) - offset - 4
        ty = (y1 + y2) / 2
        dimText = Math.abs(y2 - y1).toFixed(1)
      } else {
        const len = Math.hypot(x2 - x1, y2 - y1)
        dimText = len.toFixed(1)
        tx = (x1 + x2) / 2
        ty = (y1 + y2) / 2 - textHeight - 4
      }

      return (
        <>
          <Arrow
            points={[lx1, ly1, lx2, ly2]}
            stroke={color} strokeWidth={strokeWidth}
            pointerAtBeginning pointerAtEnding
            pointerLength={arrowSize} pointerWidth={arrowSize}
            fill={color}
            opacity={isPreview ? 0.6 : 1}
            onClick={handleClick}
            listening={!isPreview}
          />
          <Line
            points={[x1, y1, lx1, ly1]}
            stroke={color} strokeWidth={strokeWidth * 0.5}
            dash={[4, 4]} opacity={isPreview ? 0.6 : 1}
          />
          <Line
            points={[x2, y2, lx2, ly2]}
            stroke={color} strokeWidth={strokeWidth * 0.5}
            dash={[4, 4]} opacity={isPreview ? 0.6 : 1}
          />
          <Text
            x={tx} y={ty}
            text={dimText}
            fontSize={textHeight}
            fill={color}
            opacity={isPreview ? 0.6 : 1}
          />
        </>
      )
    }
  }
}
