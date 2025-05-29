import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { applyAltDecisionTree } from "./altDecisionTree.ts";

Deno.test("ALT決定木 - 装飾的な画像", () => {
  const result = applyAltDecisionTree("装飾的なパターンの背景画像");

  assertEquals(result.isDecorative, true);
  assertEquals(result.altText, "");
  assertEquals(result.reasoning.includes("装飾的"), true);
});

Deno.test("ALT決定木 - テキストを含む画像", () => {
  const result = applyAltDecisionTree(
    "「ログイン」というテキストが表示されたボタン画像",
  );

  assertEquals(result.hasText, true);
  assertEquals(result.altText.includes("ログイン"), true);
});

Deno.test("ALT決定木 - 複雑な画像（グラフ）", () => {
  const result = applyAltDecisionTree(
    "売上推移を示すグラフ画像",
    "2024年の業績",
  );

  assertEquals(result.isComplex, true);
  assertEquals(result.altText.includes("グラフ"), true);
  assertEquals(result.altText.includes("2024年の業績"), true);
});

Deno.test("ALT決定木 - 情報的な画像", () => {
  const result = applyAltDecisionTree("会社の建物の写真", "オフィス紹介");

  assertEquals(result.isInformative, true);
  assertEquals(result.altText.includes("オフィス紹介"), true);
});

Deno.test("ALT決定木 - 機能的な画像", () => {
  const result = applyAltDecisionTree("虫眼鏡のアイコン", "検索ボタン");

  assertEquals(result.altText.includes("虫眼鏡"), true);
});

Deno.test("ALT決定木 - 長い説明の切り詰め", () => {
  const longDescription = "これは非常に長い説明文です。".repeat(10);
  const result = applyAltDecisionTree(longDescription);

  assertEquals(result.altText.length <= 155, true); // 150文字 + "..."
});

Deno.test("ALT決定木 - 文脈なしの基本的な画像", () => {
  const result = applyAltDecisionTree("猫の写真");

  assertEquals(result.isDecorative, false);
  assertEquals(result.altText, "猫の写真");
});
