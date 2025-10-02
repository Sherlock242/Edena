export type ElementType = 'text'; // | 'shape';
export type CanvasElement = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  isEditing?: boolean;
};
export type Tool = 'select' | 'text' | 'shape';
