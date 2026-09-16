export interface ColorToken {
  hex: string;
  count: number;
  hsl: string;
  r: number;
  g: number;
  b: number;
}

export interface ExtractedColors {
  colors: ColorToken[];
  gradients: string[];
}

export interface TypographyTag {
  tag: string;
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  letterSpacing: string;
  colorHex: string;
  count: number;
  selector: string;
  w: number;
  h: number;
  sample: string;
}

export interface FontFamilyInfo {
  family: string;
  count: number;
  weights: string[];
}

export interface ExtractedTypography {
  tags: TypographyTag[];
  families: FontFamilyInfo[];
}

export interface ImageAsset {
  src: string;
  alt: string;
  w: number;
  h: number;
  type: string;
}

export interface BackgroundAsset {
  src: string;
  type: string;
}

export interface SvgAsset {
  id: string;
  w: number;
  h: number;
  code: string;
  dataUrl: string;
  name: string;
}

export interface VideoAsset {
  src: string;
  w: number;
  h: number;
}

export interface ExtractedAssets {
  images: ImageAsset[];
  backgrounds: BackgroundAsset[];
  svgs: SvgAsset[];
  videos: VideoAsset[];
}

export interface ExtractedTokens {
  colors: ExtractedColors;
  typography: ExtractedTypography;
  assets: ExtractedAssets;
}

export type TabType = 'overview' | 'colors' | 'type' | 'assets';
