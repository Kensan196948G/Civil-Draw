import Konva from 'konva'

export interface GridConfig {
  width: number
  height: number
  gridSize: number
  zoom: number
  panX: number
  panY: number
}

export function renderGrid(layer: Konva.Layer, config: GridConfig): void {
  layer.destroyChildren()

  const { width, height, gridSize, zoom, panX, panY } = config
  const scaledGrid = gridSize * zoom

  if (scaledGrid < 4) return

  const startX = ((-panX % scaledGrid) + scaledGrid) % scaledGrid
  const startY = ((-panY % scaledGrid) + scaledGrid) % scaledGrid

  const lineProps = {
    stroke: '#e0e0e0',
    strokeWidth: 0.5,
    listening: false,
  }

  for (let x = startX; x < width; x += scaledGrid) {
    layer.add(new Konva.Line({ ...lineProps, points: [x, 0, x, height] }))
  }
  for (let y = startY; y < height; y += scaledGrid) {
    layer.add(new Konva.Line({ ...lineProps, points: [0, y, width, y] }))
  }

  layer.batchDraw()
}
