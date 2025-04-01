export interface UserAsset {
  uuid: string;
  image: string;
  name: string;
  thumbnail: string;
  createdAt: string;
}

export interface Template {
  uuid: string;
  name: string;
  isDefault: boolean;
  size: string;
  createdAt: string;
  backgroundImage?: string;
  thumbnail?: string;
  like?: boolean;
  assignable?: boolean;
  user?: {
    id: string;
    username?: string;
  };
  images?: ImageAsset[];
  texts?: TextElement[];
  shapes?: ShapeElement[];
  imageAssets?: ImageAsset[];
  textElements?: TextElement[];
  shapeElements?: ShapeElement[];
}

export interface ImageAsset {
  uuid: string;
  image: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;
  opacity: number;
  borderRadius?: number;
}

export interface TextElement {
  uuid: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  positionX: number;
  positionY: number;
  zIndex: number;
  rotation: number;
  opacity: number;
}

export interface ShapeElement {
  uuid: string;
  shapeType: string;
  color: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;
  opacity: number;
}

export type DesignElement = ImageAsset | TextElement | ShapeElement;

export interface ElementPosition {
  x: number;
  y: number;
}

export interface ElementDimensions {
  width: number;
  height: number;
}

export enum ElementType {
  IMAGE = 'image',
  TEXT = 'text',
  SHAPE = 'shape',
}

export type TemplateSizeType = '1080x1920' | '1080x1080';

export interface CanvasState {
  width: number;
  height: number;
  scale: number;
  elements: DesignElement[];
  selectedElementId: string | null;
} 