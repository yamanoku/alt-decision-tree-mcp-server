import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { analyzeImage } from "./imageAnalyzer.ts";
import type { ImageAnalysisRequest } from "../types.ts";

// テスト用の小さなPNG画像のBase64データ（1x1ピクセルの透明画像）
const testImageBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==";

Deno.test("画像分析 - 基本的な分析", () => {
  const request: ImageAnalysisRequest = {
    imageData: testImageBase64,
    context: "テスト画像",
  };

  const result = analyzeImage(request);

  assertExists(result.altText);
  assertExists(result.reasoning);
  assertExists(result.decision);
  assertEquals(typeof result.confidence, "number");
  assertEquals(result.confidence >= 0 && result.confidence <= 1, true);
});

Deno.test("画像分析 - 文脈付きの分析", () => {
  const request: ImageAnalysisRequest = {
    imageData: testImageBase64,
    context: "プロフィール写真として使用される画像",
  };

  const result = analyzeImage(request);

  assertExists(result.altText);
  assertEquals(result.decision.isInformative, true);
});

Deno.test("画像分析 - 装飾的な画像の分析", () => {
  const request: ImageAnalysisRequest = {
    imageData: testImageBase64,
    context: "装飾として使用される背景画像",
  };

  const result = analyzeImage(request);

  assertEquals(result.decision.isDecorative, true);
  assertEquals(result.altText, "");
});

Deno.test("画像分析 - 無効な画像データのエラーハンドリング", () => {
  const request: ImageAnalysisRequest = {
    imageData: "",
    context: "テスト",
  };

  const result = analyzeImage(request);

  assertEquals(result.altText, "画像の分析に失敗しました");
  assertEquals(result.confidence, 0);
});

Deno.test("画像分析 - 異なる形式の画像", () => {
  const jpegImageBase64 =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A";

  const request: ImageAnalysisRequest = {
    imageData: jpegImageBase64,
    imageFormat: "jpeg",
  };

  const result = analyzeImage(request);

  assertExists(result.altText);
  assertEquals(typeof result.confidence, "number");
});

Deno.test("画像分析 - 信頼度計算", () => {
  const request: ImageAnalysisRequest = {
    imageData: testImageBase64,
    context: "売上推移を示す複雑なグラフ画像",
  };

  const result = analyzeImage(request);

  // 信頼度は適切な範囲内
  assertEquals(result.confidence >= 0 && result.confidence <= 1, true);
  // 結果が存在することを確認
  assertExists(result.altText);
});
