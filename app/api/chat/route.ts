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
    // クライアントから送信されたデータを受け取ります
    const { messages, model } = await request.json();

    // ユーザーの最新メッセージからファイルパスを自動検出・読込
    const lastUserMsg = [...messages].reverse().find((m: Message) => m.role === 'user');
    let referencedFiles: ReferencedLocalFile[] = [];

    let processedMessages: Message[] = messages;

    if (lastUserMsg) {
      referencedFiles = await detectAndReadLocalFiles(lastUserMsg.content);

      if (referencedFiles.length > 0) {
        // ローカルファイルの内容をコンテキストとして構築
        const contextParts = referencedFiles.map(
          (f) => `--- 参照ローカルファイル: ${f.path} (${f.lines}行) ---\n${f.content}\n--- ファイル末尾 ---`
        );
        const contextInjection = `【システム指示: 質問文で指定された以下のローカルソースコードを直接閲覧・参照して回答してください】\n\n${contextParts.join('\n\n')}`;

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

    const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');
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
