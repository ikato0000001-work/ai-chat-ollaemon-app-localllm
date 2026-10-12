// app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { Agent, fetch as ollamaFetch } from 'undici';
import { detectAndReadLocalFiles, ReferencedLocalFile } from '@/lib/localFileHelper';

// メッセージの型を定義し、TypeScriptの型安全性を確保します
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
}

interface OllamaResponse {
  message?: {
    content?: string;
  };
  content?: string;
}

interface OllamaEmbeddingResponse {
  embeddings?: number[][];
}

const OLLAMA_TIMEOUT_MS = 15 * 60 * 1000;
const ollamaDispatcher = new Agent({
  headersTimeout: OLLAMA_TIMEOUT_MS,
  bodyTimeout: OLLAMA_TIMEOUT_MS,
});

/**
 * Ollama APIと通信し、チャットの応答を返すAPIエンドポイント
 * 質問文内のローカルファイルパス自動検知・読み込みに対応
 * 
 * @param request - クライアントからのリクエスト
 * @returns Ollamaからの応答および参照ファイル一覧を含むJSON
 */
export async function POST(request: Request) {
  try {
    const requestBody = await request.json() as {
      messages?: Message[];
      input?: string;
      model?: string;
    };
    const { messages, input, model } = requestBody;
    if (typeof model !== 'string' || !model.trim()) {
      return NextResponse.json({ error: 'モデルが指定されていません。' }, { status: 400 });
    }

    const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');

    if (input !== undefined) {
      if (typeof input !== 'string' || !input.trim()) {
        return NextResponse.json({ error: '埋め込み対象の input が指定されていません。' }, { status: 400 });
      }

      const response = await ollamaFetch(`${ollamaBaseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        dispatcher: ollamaDispatcher,
        signal: request.signal,
        body: JSON.stringify({ model, input }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("unknown model architecture: 'gemma-embedding2'")) {
          return NextResponse.json({
            error: '現在起動中のOllamaランタイムがEmbeddingGemma 2のアーキテクチャ（gemma-embedding2）に対応していません。Ollamaをこのモデル形式に対応した最新版へ更新し、Ollamaを再起動してから再試行してください。',
          }, { status: 502 });
        }

        return NextResponse.json({
          error: `Ollama APIエラーが発生しました。埋め込みモデルを確認してください。詳細: ${errorText}`,
        }, { status: response.status });
      }

      const data = await response.json() as OllamaEmbeddingResponse;
      const embedding = data.embeddings?.[0];
      if (!Array.isArray(embedding) || embedding.length === 0) {
        return NextResponse.json({ error: 'Ollamaから有効な埋め込みベクトルが返されませんでした。' }, { status: 502 });
      }

      return NextResponse.json({
        response: `埋め込みベクトルを生成しました（${embedding.length}次元）。このモデルは文章生成ではなく、テキストのベクトル化に使用されます。`,
        embeddingDimensions: embedding.length,
      });
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages または input を指定してください。' }, { status: 400 });
    }

    // ユーザーの最新メッセージからファイルパスを自動検出・読込
    const lastUserMsg = [...messages].reverse().find((m: Message) => m.role === 'user');
    let referencedFiles: ReferencedLocalFile[] = [];

    let processedMessages: Message[] = messages;

    if (lastUserMsg) {
      referencedFiles = await detectAndReadLocalFiles(lastUserMsg.content);

      if (referencedFiles.length > 0) {
        // ローカルファイルの内容をコンテキストとして構築
        const contextParts = referencedFiles.map((f) =>
          f.isDirectory
            ? `--- 参照ローカルディレクトリ: ${f.path} (${f.lines}項目) ---\n${f.content}\n--- ディレクトリ末尾 ---`
            : `--- 参照ローカルファイル: ${f.path} (${f.lines}行) ---\n${f.content}\n--- ファイル末尾 ---`
        );
        const contextInjection = `【システム指示: 質問文で指定された以下のローカル環境のファイル/ディレクトリ情報を直接閲覧・参照して回答してください】\n\n${contextParts.join('\n\n')}`;

        processedMessages = messages.map((m: Message) => {
          if (m === lastUserMsg) {
            return {
              ...m,
              content: `${contextInjection}\n\n【ユーザーの質問】\n${m.content}`,
            };
          }
          return m;
        });
      }
    }

    const ollamaUrl = `${ollamaBaseUrl}/api/chat`;

    // Ollamaサーバーにリクエストを送信
    const response = await ollamaFetch(ollamaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      dispatcher: ollamaDispatcher,
      signal: request.signal,
      body: JSON.stringify({
        model: model,
        messages: processedMessages.map((m: Message) => ({
          role: m.role === 'user' ? 'user' : m.role === 'system' ? 'system' : 'assistant',
          content: m.content,
          ...(m.images?.length ? { images: m.images } : {}),
        })),
        options: {
          num_ctx: 32768,
          num_predict: 8192,
        },
        stream: false,
      }),
    });

    // Ollama APIからのレスポンスがエラーコードだった場合
    if (!response.ok) {
      const errorText = await response.text(); 
      return NextResponse.json({ 
        error: `Ollama APIエラーが発生しました。Ollamaが起動しているか確認してください。詳細: ${errorText}` 
      }, { status: response.status });
    }

    // 正常なレスポンスの場合、JSONとして解析
    const data = await response.json() as OllamaResponse;

    // AIの応答テキストを返却
    const answer = data.message?.content || data.content || '';
    return NextResponse.json({
      response: answer,
      referencedLocalFiles: referencedFiles.map((f) => ({
        path: f.path,
        name: f.name,
        lines: f.lines,
        size: f.size,
        isDirectory: f.isDirectory,
      })),
    });

  } catch (error) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    console.error('Ollama API呼び出し中にエラーが発生しました:', error);

    if (error instanceof Error && error.cause instanceof Error && 'code' in error.cause) {
      const errorCode = String(error.cause.code);
      if (errorCode === 'UND_ERR_HEADERS_TIMEOUT') {
        return NextResponse.json(
          { error: 'Ollamaの応答が15分を超えました。軽量モデルを選ぶか、質問・添付内容を短くしてください。' },
          { status: 504 },
        );
      }
    }
    
    return NextResponse.json({ error: '内部処理エラー: Ollamaサーバーとの通信に失敗しました。' }, { status: 500 });
  }
}
