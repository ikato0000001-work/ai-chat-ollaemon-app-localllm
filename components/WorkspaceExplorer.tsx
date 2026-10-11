// components/WorkspaceExplorer.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CodeViewer from './CodeViewer';
import { CodeFile } from '@/types/chat';

export interface WorkspaceItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  extension?: string;
}

interface WorkspaceExplorerProps {
  onAttachFile?: (file: { name: string; path: string; content: string }) => void;
  onAskAboutFile?: (file: { name: string; path: string; content: string }) => void;
}

export default function WorkspaceExplorer({ onAttachFile, onAskAboutFile }: WorkspaceExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>('C:\\Portfolio');
  const [pathInput, setPathInput] = useState<string>('C:\\Portfolio');
  const [parentPath, setParentPath] = useState<string | null>(null);
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [presets, setPresets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 選択中のファイル情報
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [selectedFileLines, setSelectedFileLines] = useState<number>(0);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [attachFeedback, setAttachFeedback] = useState<string>('');

  // プリセットの読み込み
  useEffect(() => {
    fetch('/api/workspace?action=presets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.presets)) {
          setPresets(data.presets);
        }
      })
      .catch((err) => console.error('Presets取得エラー:', err));
  }, []);

  // ディレクトリ一覧取得
  const loadDirectory = useCallback(async (dirPath: string) => {
    setIsLoading(true);
    setError('');
    setSelectedFile(null);

    try {
      const res = await fetch(`/api/workspace?action=list&path=${encodeURIComponent(dirPath)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'ディレクトリの読み込みに失敗しました。');
      }

      setCurrentPath(data.currentPath);
      setPathInput(data.currentPath);
      setParentPath(data.parentPath);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  // ファイル読込
  const handleSelectFile = async (item: WorkspaceItem) => {
    if (item.isDirectory) {
      void loadDirectory(item.path);
      return;
    }

    setIsLoadingFile(true);
    setError('');

    try {
      const res = await fetch(`/api/workspace?action=read&path=${encodeURIComponent(item.path)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'ファイルの読み込みに失敗しました。');
      }

      const ext = item.extension?.replace(/^\./, '') || 'plaintext';
      const file: CodeFile = {
        id: `ws-${Date.now()}`,
        name: data.name,
        path: data.path,
        language: ext,
        content: data.content,
      };

      setSelectedFile(file);
      setSelectedFileLines(data.lines || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイル読み込みエラー');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleAttach = () => {
    if (!selectedFile || !onAttachFile) return;
    onAttachFile({
      name: selectedFile.name,
      path: selectedFile.path,
      content: selectedFile.content,
    });
    setAttachFeedback('添付完了！');
    setTimeout(() => setAttachFeedback(''), 2000);
  };

  const handleAsk = () => {
    if (!selectedFile || !onAskAboutFile) return;
    onAskAboutFile({
      name: selectedFile.name,
      path: selectedFile.path,
      content: selectedFile.content,
    });
  };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (ext?: string) => {
    switch (ext) {
      case '.ts':
      case '.tsx':
        return '🔷';
      case '.js':
      case '.jsx':
      case '.mjs':
        return '🟨';
      case '.json':
        return '📜';
      case '.css':
      case '.scss':
        return '🎨';
      case '.html':
        return '🌐';
      case '.py':
        return '🐍';
      case '.java':
        return '☕';
      case '.md':
      case '.txt':
        return '📝';
      case '.pdf':
        return '📕';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* 上部: パスバーとプリセット */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
        {/* プリセットボタン */}
        {presets.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
            <span className="text-slate-400 shrink-0 text-[11px]">📁 候補:</span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => void loadDirectory(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono shrink-0 transition ${
                  currentPath === preset
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* パス入力と移動 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pathInput.trim()) void loadDirectory(pathInput.trim());
          }}
          className="flex items-center gap-1.5"
        >
          {parentPath && (
            <button
              type="button"
              onClick={() => void loadDirectory(parentPath)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition shrink-0"
              title="親ディレクトリへ移動"
            >
              ⬆️ 上へ
            </button>
          )}

          <input
            type="text"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            placeholder="C:\Portfolio\..."
            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-100 focus:outline-hidden focus:border-indigo-500"
          />

          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shrink-0"
          >
            移動
          </button>
        </form>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="px-3 py-2 bg-red-900/60 border-b border-red-700 text-red-200 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* メインペイン: 左右スプリット（一覧とプレビュー） */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側: ファイル・フォルダ一覧 */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col h-full overflow-hidden bg-slate-950/40">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
            <span>項目一覧 ({items.length})</span>
            {isLoading && <span className="text-indigo-400 animate-pulse">読込中...</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 font-mono text-xs">
            {items.map((item) => {
              const isSelected = selectedFile?.path === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => void handleSelectFile(item)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition ${
                    isSelected
                      ? 'bg-indigo-950 text-indigo-200 border border-indigo-700/80'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">
                      {item.isDirectory ? '📁' : getFileIcon(item.extension)}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </span>

                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {item.isDirectory ? 'フォルダ' : formatSize(item.size)}
                  </span>
                </button>
              );
            })}

            {!isLoading && items.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-xs">
                フォルダ内に表示可能なファイルがありません
              </div>
            )}
          </div>
        </div>

        {/* 右側: 選択ファイルプレビュー */}
        <div className="w-1/2 flex flex-col h-full overflow-hidden bg-slate-900">
          {isLoadingFile ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs animate-pulse">
              ファイルを読み込み中...
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col h-full">
              {/* プレビューヘッダー・アクション */}
              <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 truncate" title={selectedFile.path}>
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {selectedFileLines} 行 • {selectedFile.language}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onAttachFile && (
                    <button
                      type="button"
                      onClick={handleAttach}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-xs"
                      title="チャット入力欄の添付ファイルに追加"
                    >
                      <span>📎</span>
                      <span>{attachFeedback || 'チャットに添付'}</span>
                    </button>
                  )}

                  {onAskAboutFile && (
                    <button
                      type="button"
                      onClick={handleAsk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-xs"
                      title="このファイルについて質問文をセット"
                    >
                      <span>💬</span>
                      <span>質問する</span>
                    </button>
                  )}
                </div>
              </div>

              {/* コード閲覧領域 */}
              <div className="flex-1 overflow-hidden p-2">
                <CodeViewer file={selectedFile} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs p-6 text-center space-y-2">
              <span className="text-3xl">👈</span>
              <p className="font-semibold text-slate-400">ファイルを選択してください</p>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                左側の一覧からファイルをクリックすると、ここにソースコードが表示され、ワンクリックでチャットのコンテキストに追加できます。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
