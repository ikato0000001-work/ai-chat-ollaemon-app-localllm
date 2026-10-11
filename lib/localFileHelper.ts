// lib/localFileHelper.ts

import fs from 'node:fs/promises';
import path from 'node:path';

export interface ReferencedLocalFile {
  path: string;
  name: string;
  lines: number;
  size: number;
  content: string;
}

const MAX_AUTO_READ_BYTES = 300 * 1024; // 300 KB
const MAX_DETECTED_FILES = 5;

/**
 * テキスト中から Windows 絶対パスおよび @相対パス を抽出し、
 * 実在するファイルの内容を読み取って返します。
 */
export async function detectAndReadLocalFiles(
  text: string,
  baseDir: string = process.cwd(),
): Promise<ReferencedLocalFile[]> {
  if (!text || typeof text !== 'string') return [];

  const foundPaths = new Set<string>();

  // 1. Windows 絶対パス (例: C:\Portfolio\... または C:/Portfolio/...)
  const winPathRegex = /[a-zA-Z]:[\\/](?:[^\\/:*?"<>|\r\n\t\s]+[\\/])*[^\\/:*?"<>|\r\n\t\s]+\.[a-zA-Z0-9_-]+/g;
  let match: RegExpExecArray | null;
  while ((match = winPathRegex.exec(text)) !== null) {
    const cleaned = match[0].replace(/[)\]}>'"`]+$/, ''); // 末尾の記号を除去
    foundPaths.add(path.resolve(cleaned));
  }

  // 2. @ プレフィックスによるパス指定 (例: @app/layout.tsx, @./package.json)
  const atPathRegex = /@([a-zA-Z0-9_.\-\\/]+\.[a-zA-Z0-9_-]+)/g;
  while ((match = atPathRegex.exec(text)) !== null) {
    const relPath = match[1];
    foundPaths.add(path.resolve(baseDir, relPath));
    // C:\Portfolio からの解決も試行
    if (!relPath.startsWith('C:')) {
      foundPaths.add(path.resolve('C:\\Portfolio', relPath));
    }
  }

  const results: ReferencedLocalFile[] = [];

  for (const candidatePath of foundPaths) {
    if (results.length >= MAX_DETECTED_FILES) break;

    try {
      const stat = await fs.stat(/*turbopackIgnore: true*/ candidatePath);
      if (!stat.isFile()) continue;
      if (stat.size > MAX_AUTO_READ_BYTES) continue;

      const content = await fs.readFile(/*turbopackIgnore: true*/ candidatePath, 'utf-8');
      const lines = content.split('\n').length;

      results.push({
        path: candidatePath,
        name: path.basename(candidatePath),
        lines,
        size: stat.size,
        content,
      });
    } catch {
      // ファイルが存在しない、またはアクセス権限がない場合は無視
    }
  }

  return results;
}
