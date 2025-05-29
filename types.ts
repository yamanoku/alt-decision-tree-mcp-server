export interface ImageAnalysisRequest {
  imageData: string; // Base64-encoded image data
  context?: string; // Optional context for generating alt text
  imageFormat?: "png" | "jpg" | "jpeg" | "gif" | "webp";
}

export interface AltTextDecision {
  isDecorative: boolean;
  hasText: boolean;
  isInformative: boolean;
  isComplex: boolean;
  altText: string;
  reasoning: string;
}

export interface ImageAnalysisResponse {
  altText: string;
  reasoning: string;
  decision: AltTextDecision;
  confidence: number;
}
