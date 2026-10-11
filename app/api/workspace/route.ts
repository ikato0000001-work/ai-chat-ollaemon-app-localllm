// app/api/workspace/route.ts

import { NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

const IGNORED_NAMES = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'out',
  '.turbo',
  '.vscode',
  '.idea',
  'bin',
  'obj',
  'coverage',
]);

const MAX_READ_SIZE_BYTES = 500 * 1024; // 500 KB

export interface WorkspaceItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  extension?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') ?? 'list';
    const targetPath = searchParams.get('path');

    if (action === 'presets') {
      const presets = [
        'C:\\Portfolio',
        process.cwd(),
      ];
      // 重複排除と存在チェック
      const validPresets: string[] = [];
      for (const p of presets) {
        try {
          const stat = await fs.stat(/*turbopackIgnore: true*/ p);
          if (stat.isDirectory() && !validPresets.includes(p)) {
            validPresets.push(p);
          }
        } catch {
          // 存在しない場合はスキップ
        }
      }
      return NextResponse.json({ presets: validPresets });
    }

    if (action === 'read') {
      if (!targetPath) {
        return NextResponse.json({ error: 'ファイルパスが指定されていません。' }, { status: 400 });
      }

      const normalized = path.resolve(targetPath);
      const stat = await fs.stat(/*turbopackIgnore: true*/ normalized);

      if (stat.isDirectory()) {
        return NextResponse.json({ error: '指定されたパスはディレクトリです。' }, { status: 400 });
      }

      if (stat.size > MAX_READ_SIZE_BYTES) {
        return NextResponse.json({
          error: `ファイルサイズが大きすぎます（${(stat.size / 1024).toFixed(1)} KB）。500 KB 以下のファイルを選択してください。`,
        }, { status: 400 });
      }

      const content = await fs.readFile(/*turbopackIgnore: true*/ normalized, 'utf-8');
      const lines = content.split('\n').length;

      return NextResponse.json({
        name: path.basename(normalized),
        path: normalized,
        content,
        lines,
        size: stat.size,
      });
    }

    // action === 'list' または 'tree'
    const dirPath = targetPath ? path.resolve(targetPath) : 'C:\\Portfolio';

    try {
      const stat = await fs.stat(/*turbopackIgnore: true*/ dirPath);
      if (!stat.isDirectory()) {
        return NextResponse.json({ error: '指定されたパスはディレクトリではありません。' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: `ディレクトリが見つかりません: ${dirPath}` }, { status: 404 });
    }

    const dirents = await fs.readdir(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });
    const items: WorkspaceItem[] = [];

    for (const dirent of dirents) {
      if (IGNORED_NAMES.has(dirent.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, dirent.name);
      const isDir = dirent.isDirectory();
      let size: number | undefined;

      if (!isDir) {
        try {
          const fstat = await fs.stat(/*turbopackIgnore: true*/ fullPath);
          size = fstat.size;
        } catch {
          // エラー時はスキップまたは undefined
        }
      }

      items.push({
        name: dirent.name,
        path: fullPath,
        isDirectory: isDir,
        size,
        extension: isDir ? undefined : path.extname(dirent.name).toLowerCase(),
      });
    }

    // フォルダ優先、その後名前順でソート
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    return NextResponse.json({
      currentPath: dirPath,
      parentPath: path.dirname(dirPath) !== dirPath ? path.dirname(dirPath) : null,
      items,
    });

  } catch (error) {
    console.error('Workspace API エラー:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ファイルシステム処理中にエラーが発生しました。' },
      { status: 500 },
    );
  }
}
