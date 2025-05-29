import type { AltTextDecision } from "../types.ts";

/**
 * ALT決定木のロジック
 * W3C WAI-ARIAガイドラインに基づく代替テキスト決定プロセス
 */
export function applyAltDecisionTree(
  imageDescription: string,
  context?: string,
): AltTextDecision {
  // 基本的な分析
  const isDecorative = analyzeIfDecorative(imageDescription, context);
  const hasText = analyzeIfHasText(imageDescription);
  const isInformative = analyzeIfInformative(imageDescription, context);
  const isComplex = analyzeIfComplex(imageDescription);

  let altText = "";
  let reasoning = "";

  // 決定木のロジック
  if (isDecorative) {
    altText = "";
    reasoning =
      "画像は装飾的な目的で使用されているため、代替テキストは空にします。";
  } else if (hasText && isInformative) {
    // 画像内のテキストを含む情報的な画像
    altText = extractTextFromDescription(imageDescription);
    reasoning = "画像内のテキスト情報を代替テキストとして使用します。";
  } else if (isComplex) {
    // 複雑な画像（グラフ、図表など）
    altText = generateComplexImageAlt(imageDescription, context);
    reasoning =
      "複雑な画像のため、主要な情報と詳細説明を含む代替テキストを生成しました。";
  } else if (isInformative) {
    // 一般的な情報的画像
    altText = generateInformativeAlt(imageDescription, context);
    reasoning =
      "情報的な画像として、画像の内容と目的を表現する代替テキストを生成しました。";
  } else {
    // 機能的な画像
    altText = generateFunctionalAlt(imageDescription, context);
    reasoning =
      "機能的な画像として、画像の機能や目的を表現する代替テキストを生成しました。";
  }

  return {
    isDecorative,
    hasText,
    isInformative,
    isComplex,
    altText,
    reasoning,
  };
}

function analyzeIfDecorative(description: string, context?: string): boolean {
  const decorativeKeywords = [
    "装飾",
    "decoration",
    "背景",
    "background",
    "パターン",
    "pattern",
    "枠",
    "border",
    "線",
    "line",
    "分割線",
    "divider",
  ];

  if (context?.includes("装飾") || context?.includes("decoration")) {
    return true;
  }

  return decorativeKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase())
  );
}

function analyzeIfHasText(description: string): boolean {
  const textKeywords = [
    "テキスト",
    "text",
    "文字",
    "文言",
    "メッセージ",
    "message",
    "タイトル",
    "title",
    "見出し",
    "heading",
    "ラベル",
    "label",
    "ボタン",
    "button",
    "リンク",
    "link",
  ];

  return textKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase())
  );
}

function analyzeIfInformative(description: string, context?: string): boolean {
  const informativeKeywords = [
    "写真",
    "photo",
    "画像",
    "image",
    "イラスト",
    "illustration",
    "図",
    "figure",
    "説明",
    "explanation",
    "表示",
    "display",
  ];

  if (context && (context.includes("説明") || context.includes("情報"))) {
    return true;
  }

  return informativeKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase())
  );
}

function analyzeIfComplex(description: string): boolean {
  const complexKeywords = [
    "グラフ",
    "graph",
    "チャート",
    "chart",
    "表",
    "table",
    "図表",
    "diagram",
    "フローチャート",
    "flowchart",
    "地図",
    "map",
    "複雑",
    "complex",
    "詳細",
    "detail",
    "複雑なグラフ",
  ];

  return complexKeywords.some((keyword) =>
    description.toLowerCase().includes(keyword.toLowerCase())
  );
}

function extractTextFromDescription(description: string): string {
  // 画像内のテキストを抽出するためのシンプルなロジック
  const textPatterns = [
    /「([^」]+)」/g,
    /"([^"]+)"/g,
    /テキスト[：:]\s*([^\n,。]+)/g,
    /文字[：:]\s*([^\n,。]+)/g,
  ];

  for (const pattern of textPatterns) {
    const matches = description.match(pattern);
    if (matches) {
      return matches.map((match) => match.replace(/[「」"：:]/g, "")).join(
        ", ",
      );
    }
  }

  return description.length > 100
    ? description.substring(0, 100) + "..."
    : description;
}

function generateComplexImageAlt(
  description: string,
  context?: string,
): string {
  let alt = "";

  if (description.includes("グラフ") || description.includes("chart")) {
    alt = "グラフ: " + description.substring(0, 150);
  } else if (description.includes("表") || description.includes("table")) {
    alt = "表: " + description.substring(0, 150);
  } else if (description.includes("図表") || description.includes("diagram")) {
    alt = "図表: " + description.substring(0, 150);
  } else {
    alt = description.substring(0, 150);
  }

  if (context) {
    alt = `${context}に関する${alt}`;
  }

  return alt + (description.length > 150 ? "..." : "");
}

function generateInformativeAlt(description: string, context?: string): string {
  let alt = description.length > 125
    ? description.substring(0, 125) + "..."
    : description;

  if (context) {
    alt = `${context}: ${alt}`;
  }

  return alt;
}

function generateFunctionalAlt(description: string, context?: string): string {
  if (context) {
    if (context.includes("ボタン") || context.includes("button")) {
      return `${description}ボタン`;
    } else if (context.includes("リンク") || context.includes("link")) {
      return `${description}へのリンク`;
    }
  }

  return description.length > 100
    ? description.substring(0, 100) + "..."
    : description;
}
