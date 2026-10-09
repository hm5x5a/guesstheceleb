export type StrokeMode = 'paint' | 'erase';

export type ToolShape = 'brush' | 'rect' | 'ellipse' | 'lasso';

export interface Stroke {
  id: string;
  mode: StrokeMode;
  shape: ToolShape;
  size: number;       // normalized fraction of image width (0.01 to 0.4)
  hardness: number;   // 0 (super soft feather) to 1 (hard edge)
  points: [number, number][]; // normalized coordinates [0..1, 0..1]
}

export type RevealStyle = 'cut' | 'fade' | 'wipe' | 'zoom';

export type AspectRatio = '9:16' | '1:1' | 'original';

export interface Project {
  id: string;
  name?: string;
  createdAt: number;
  imageBlob: Blob;
  thumbBlob?: Blob;
  imageWidth: number;
  imageHeight: number;
  strokes: Stroke[];
  revealStyle: RevealStyle;
  holdSeconds: number;
  aspect: AspectRatio;
  caption: string;
}

export interface RevealStateResult {
  maskAlpha: number;
  wipe?: number; // 0 (hidden) to 1 (fully revealed)
  scale?: number; // 1 to 1.08
}

export interface PresetMask {
  id: 'hairline' | 'beard' | 'eyes' | 'sides';
  name: string;
  description: string;
  iconName: string;
}
