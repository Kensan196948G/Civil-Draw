export type LineStyle = 'solid' | 'dashed' | 'dashdot'

export interface BaseShape {
  id: string
  layerId: string
  locked: boolean
}

export interface LineShape extends BaseShape {
  type: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface RectShape extends BaseShape {
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface CircleShape extends BaseShape {
  type: 'circle'
  cx: number
  cy: number
  radius: number
}

export interface PolylineShape extends BaseShape {
  type: 'polyline'
  points: number[]
  closed: boolean
}

export interface TextShape extends BaseShape {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
  rotation: number
}

export interface DimensionShape extends BaseShape {
  type: 'dimension'
  x1: number
  y1: number
  x2: number
  y2: number
  orientation: 'horizontal' | 'vertical' | 'parallel'
  offset: number
  textHeight: number
  arrowSize: number
}

export type Shape =
  | LineShape
  | RectShape
  | CircleShape
  | PolylineShape
  | TextShape
  | DimensionShape

export type ToolType =
  | 'select'
  | 'line'
  | 'rect'
  | 'circle'
  | 'polyline'
  | 'text'
  | 'dimension'

export interface Point {
  x: number
  y: number
}
