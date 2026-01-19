export enum ShapeType {
  HEART = 'Heart',
  SPHERE = 'Sphere',
  SATURN = 'Saturn',
  FLOWER = 'Flower',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
  CUSTOM = 'AI Generated'
}

export interface AppState {
  currentShape: ShapeType;
  particleColor: string;
  particleCount: number;
  isGenerating: boolean;
  customPoints: number[] | null; // Flat array [x,y,z, x,y,z...]
}

export interface HandGestureState {
  pinchStrength: number; // Average 0 (open palm) to 1 (fist)
  handDistance: number; // 0 to 1+ relative to screen width
  handsDetected: number;
}
