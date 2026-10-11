// lib/localFileHelper.ts

import fs from 'node:fs/promises';
import path from 'node:path';

export interface ReferencedLocalFile {
  path: string;
  name: string;
  lines: number;
  size: number;
  content: string;
  isDirectory?: boolean;
}

const MAX_AUTO_READ_BYTES = 300 * 1024; // 300 KB
const MAX_DETECTED_PATHS = 5;

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

/**
 * 指定ディレクトリのファイルツリー構造をテキスト化します
 */
async function buildDirectoryTreeText(
  dirPath: string,
  prefix = '',
  currentDepth = 0,
  maxDepth = 3,
): Promise<{ lines: string[]; totalFiles: number; totalDirs: number }> {
  let lines: string[] = [];
  let totalFiles = 0;
  let totalDirs = 0;

  if (currentDepth > maxDepth) {
    return { lines: [`${prefix}... (これ以降の階層を省略)`], totalFiles, totalDirs };
  }

  try {
    const dirents = await fs.readdir(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });
    const filtered = dirents.filter((d) => !IGNORED_NAMES.has(d.name));

    // ディレクトリ優先、その後名前順でソート
    filtered.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    for (let i = 0; i < filtered.length; i++) {
      const dirent = filtered[i];
      const isLast = i === filtered.length - 1;
      const pointer = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      const fullPath = path.join(dirPath, dirent.name);

      if (dirent.isDirectory()) {
        totalDirs++;
        lines.push(`${prefix}${pointer}${dirent.name}/`);
        const sub = await buildDirectoryTreeText(fullPath, nextPrefix, currentDepth + 1, maxDepth);
        lines = lines.concat(sub.lines);
        totalFiles += sub.totalFiles;
        totalDirs += sub.totalDirs;
      } else {
        totalFiles++;
        lines.push(`${prefix}${pointer}${dirent.name}`);
      }
    }
  } catch {
    lines.push(`${prefix}[アクセスエラーまたは読み込み不可]`);
  }

  return { lines, totalFiles, totalDirs };
}

/**
 * テキスト中から Windows パス（ファイルおよびディレクトリ）や @相対パス を抽出し、
 * ファイル内容またはディレクトリツリーを読み取って返します。
 */
export async function detectAndReadLocalFiles(
  text: string,
  baseDir: string = process.cwd(),
): Promise<ReferencedLocalFile[]> {
  if (!text || typeof text !== 'string') return [];

  const foundPaths = new Set<string>();

  // 1. Windows パス（ファイルおよびディレクトリに対応）
  const winPathRegex = /[a-zA-Z]:[\\/](?:[^\\/:*?"<>|\r\n\t\s`'"（）「」『』【】、。]+[\\/]?)+/g;
  let match: RegExpExecArray | null;
  while ((match = winPathRegex.exec(text)) !== null) {
    let cleaned = match[0].replace(/[)\]}>'"`、。]+$/, ''); // 末尾の記号を除去
    cleaned = cleaned.replace(/[\\/]+$/, ''); // 末尾スラッシュ正規化
    if (cleaned.length >= 3) {
      foundPaths.add(path.resolve(cleaned));
    }
  }

  // 2. @ プレフィックスによるパス指定 (例: @app/layout.tsx, @package.json, @app)
  const atPathRegex = /@([a-zA-Z0-9_.\-\\/]+)/g;
  while ((match = atPathRegex.exec(text)) !== null) {
    const relPath = match[1].replace(/[\\/]+$/, '');
    foundPaths.add(path.resolve(baseDir, relPath));
    if (!relPath.startsWith('C:')) {
      foundPaths.add(path.resolve('C:\\Portfolio', relPath));
    }
  }

  const results: ReferencedLocalFile[] = [];

  for (const candidatePath of foundPaths) {
    if (results.length >= MAX_DETECTED_PATHS) break;

    try {
      const stat = await fs.stat(/*turbopackIgnore: true*/ candidatePath);

      if (stat.isFile()) {
        if (stat.size > MAX_AUTO_READ_BYTES) continue;
        const content = await fs.readFile(/*turbopackIgnore: true*/ candidatePath, 'utf-8');
        const lines = content.split('\n').length;

        results.push({
          path: candidatePath,
          name: path.basename(candidatePath),
          lines,
          size: stat.size,
          content,
          isDirectory: false,
        });
      } else if (stat.isDirectory()) {
        // ディレクトリの場合: ディレクトリツリーと主要設定ファイルを読み込む
        const treeInfo = await buildDirectoryTreeText(candidatePath);
        const parts: string[] = [
          `📁 ディレクトリパス: ${candidatePath}`,
          `構成概要: ${treeInfo.totalFiles} ファイル、${treeInfo.totalDirs} フォルダ`,
          '【ディレクトリ構造】',
          `${path.basename(candidatePath)}/`,
          ...treeInfo.lines,
        ];

        // 直下に package.json がある場合は概要として読み込み
        const pkgJsonPath = path.join(candidatePath, 'package.json');
        try {
          const pkgStat = await fs.stat(/*turbopackIgnore: true*/ pkgJsonPath);
          if (pkgStat.isFile() && pkgStat.size <= 50 * 1024) {
            const pkgContent = await fs.readFile(/*turbopackIgnore: true*/ pkgJsonPath, 'utf-8');
            parts.push('', '【package.json の設定内容】', pkgContent);
          }
        } catch {
          // package.json がなければ無視
        }

        results.push({
          path: candidatePath,
          name: `${path.basename(candidatePath)}/`,
          lines: treeInfo.totalFiles + treeInfo.totalDirs,
          size: 0,
          content: parts.join('\n'),
          isDirectory: true,
        });
      }
    } catch {
      // パスが存在しない、またはアクセス権限がない場合は無視
    }
  }

  return results;
}
