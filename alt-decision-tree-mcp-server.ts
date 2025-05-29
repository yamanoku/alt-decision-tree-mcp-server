// alt-decision-tree-mcp-server.ts
import { McpServer } from "npm:@modelcontextprotocol/sdk@^1.11.1/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@^1.11.1/server/stdio.js";
import { z } from "npm:zod@^3.24.4";
import { analyzeImage } from "./tools/index.ts";
import type { ImageAnalysisRequest } from "./types.ts";
import DenoJSON from "./deno.json" with { type: "json" };

// MCPサーバーの初期化
const server = new McpServer({
  name: "ALT Decision Tree MCP Server",
  version: DenoJSON.version,
  capabilities: {
    tools: {},
  },
});

// 画像から代替テキストを生成
server.tool(
  "generate_alt_text",
  "画像をアップロードしてALT決定木に基づく適切な代替テキストを生成します",
  {
    imageData: z.string().describe(
      "Base64エンコードされた画像データ（data:image/...;base64,... 形式）",
    ),
    context: z.string().optional().describe("画像の文脈や用途に関する追加情報"),
    imageFormat: z.enum(["png", "jpg", "jpeg", "gif", "webp"]).optional()
      .describe("画像フォーマット"),
  },
  ({ imageData, context, imageFormat }: {
    imageData: string;
    context?: string;
    imageFormat?: "png" | "jpg" | "jpeg" | "gif" | "webp";
  }) => {
    try {
      const request: ImageAnalysisRequest = {
        imageData,
        context,
        imageFormat,
      };

      const response = analyzeImage(request);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                altText: response.altText,
                reasoning: response.reasoning,
                decision: response.decision,
                confidence: response.confidence,
                analysis: {
                  isDecorative: response.decision.isDecorative,
                  hasText: response.decision.hasText,
                  isInformative: response.decision.isInformative,
                  isComplex: response.decision.isComplex,
                },
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: `代替テキスト生成エラー: ${
                  error instanceof Error ? error.message : "不明なエラー"
                }`,
                altText: "画像",
                reasoning:
                  "エラーが発生したため、基本的な代替テキストを提供します。",
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

// ALT決定木のガイダンスを提供
server.tool(
  "get_alt_guidance",
  "ALT決定木のガイダンスと代替テキスト作成のベストプラクティスを提供します",
  {},
  () => {
    const guidance = {
      title: "代替テキスト決定ガイド",
      decisionTree: {
        step1: {
          question: "この画像は装飾的な目的ですか？",
          yesAction: 'alt="" （空の代替テキスト）',
          noAction: "ステップ2へ",
        },
        step2: {
          question: "画像にテキストが含まれていますか？",
          yesAction: "そのテキストを代替テキストとして使用",
          noAction: "ステップ3へ",
        },
        step3: {
          question: "画像は複雑（グラフ、図表など）ですか？",
          yesAction: "簡潔な説明 + 詳細説明へのリンクまたは長い説明",
          noAction: "ステップ4へ",
        },
        step4: {
          question: "画像は情報的ですか？",
          yesAction: "画像の内容と目的を簡潔に説明",
          noAction: "機能的な目的を説明",
        },
      },
      bestPractices: [
        "代替テキストは簡潔で分かりやすく",
        "画像の機能や目的を説明する",
        "冗長な表現（「画像」「写真」）は避ける",
        "文脈に応じて適切な詳細レベルを選択",
        "装飾的な画像には空の代替テキストを使用",
      ],
      examples: {
        decorative: {
          description: "装飾的な境界線",
          altText: "",
          reasoning: "装飾的な要素のため",
        },
        informative: {
          description: "会社のロゴ",
          altText: "○○株式会社",
          reasoning: "ロゴの企業名を表示",
        },
        functional: {
          description: "検索ボタンのアイコン",
          altText: "検索",
          reasoning: "ボタンの機能を説明",
        },
        complex: {
          description: "売上推移グラフ",
          altText: "2020年から2024年の売上推移グラフ、詳細は下記の表を参照",
          reasoning: "グラフの概要と詳細情報の場所を示す",
        },
      },
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(guidance, null, 2),
        },
      ],
    };
  },
);

// 起動
async function setMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ALT MCP Server running on stdio");
}

setMCPServer().catch((error) => {
  console.error("Fatal error in setMCPServer():", error);
  Deno.exit(1);
});
