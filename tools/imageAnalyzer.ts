import type { ImageAnalysisRequest, ImageAnalysisResponse } from "../types.ts";
import { applyAltDecisionTree } from "./altDecisionTree.ts";

/**
 * 画像を分析して代替テキストを生成する
 */
export function analyzeImage(
  request: ImageAnalysisRequest,
): ImageAnalysisResponse {
  try {
    // 画像データの基本検証
    if (!request.imageData) {
      throw new Error("画像データが提供されていません");
    }

    // Base64データのデコードと基本情報の取得
    const imageInfo = getImageInfo(request.imageData);

    // 画像の内容分析（ここでは簡単な分析例）
    const imageDescription = analyzeImageContent(request.imageData, imageInfo);

    // ALT決定木を適用
    const decision = applyAltDecisionTree(imageDescription, request.context);

    // 信頼度スコアの計算
    const confidence = calculateConfidence(decision, imageDescription);

    return {
      altText: decision.altText,
      reasoning: decision.reasoning,
      decision,
      confidence,
    };
  } catch (error) {
    console.error("画像分析エラー:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "不明なエラー";
    return {
      altText: "画像の分析に失敗しました",
      reasoning: `エラーが発生しました: ${errorMessage}`,
      decision: {
        isDecorative: false,
        hasText: false,
        isInformative: true,
        isComplex: false,
        altText: "画像の分析に失敗しました",
        reasoning: `エラーが発生しました: ${errorMessage}`,
      },
      confidence: 0,
    };
  }
}

interface ImageInfo {
  format: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

function getImageInfo(base64Data: string): ImageInfo {
  try {
    // Base64データからヘッダー情報を抽出
    const dataUrlMatch = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!dataUrlMatch) {
      throw new Error("無効なBase64画像データ形式");
    }

    const format = dataUrlMatch[1];
    const actualData = dataUrlMatch[2];
    const size = Math.round((actualData.length * 3) / 4); // Base64デコード後のおおよそのサイズ

    return {
      format,
      size,
      // 実際の実装では画像ライブラリを使用して寸法を取得
      dimensions: { width: 0, height: 0 },
    };
  } catch (error) {
    console.error("画像情報取得エラー:", error);
    return {
      format: "unknown",
      size: 0,
    };
  }
}

function analyzeImageContent(base64Data: string, imageInfo: ImageInfo): string {
  // 実際の実装では、ここで画像認識APIや機械学習モデルを使用
  // 今回はサンプル実装として、画像形式とサイズから推測的な説明を生成

  const descriptions = [];

  // 形式による基本的な判断
  if (imageInfo.format === "png" && imageInfo.size < 5000) {
    descriptions.push("小さなアイコンまたは装飾的な画像");
  } else if (imageInfo.format === "jpg" || imageInfo.format === "jpeg") {
    descriptions.push("写真またはイラスト");
  } else if (imageInfo.format === "svg") {
    descriptions.push("ベクター形式の図表またはアイコン");
  }

  // サイズによる判断
  if (imageInfo.size > 100000) {
    descriptions.push("高解像度の詳細な画像");
  } else if (imageInfo.size < 10000) {
    descriptions.push("小さなアイコンまたはサムネイル");
  }

  // Base64データから簡単なパターン分析
  const dataStart = base64Data.substring(0, 100);
  if (dataStart.includes("iVBORw0KGgo")) {
    descriptions.push("PNG形式の画像");
  } else if (dataStart.includes("/9j/")) {
    descriptions.push("JPEG形式の画像");
  }

  // デフォルトの説明を生成
  if (descriptions.length === 0) {
    descriptions.push("画像ファイル");
  }

  return descriptions.join("、");
}

function calculateConfidence(
  decision: { isDecorative: boolean; hasText: boolean; isComplex: boolean },
  description: string,
): number {
  let confidence = 0.5; // ベースライン信頼度

  // 決定的な要素がある場合は信頼度を上げる
  if (decision.isDecorative) {
    confidence += 0.3;
  }

  if (decision.hasText) {
    confidence += 0.2;
  }

  if (decision.isComplex) {
    confidence += 0.1;
  }

  // 説明の詳細度に基づく調整
  if (description.length > 50) {
    confidence += 0.1;
  }

  if (description.length > 100) {
    confidence += 0.1;
  }

  // 信頼度は0-1の範囲に制限
  return Math.min(1.0, Math.max(0.0, confidence));
}
