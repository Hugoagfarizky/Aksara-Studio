import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckSquare,
  Code,
  Copy,
  FileText,
  Heading1,
  Heading2,
  Info,
  LayoutGrid,
  Minus,
  Network,
  Plus,
  Quote,
  RefreshCw,
  Table,
  Trash2,
} from 'lucide-react';
import { BlockType, NoteBlock } from '../types/note';

interface BlockWikiEditorProps {
  blocks: NoteBlock[];
  onChange: (nextBlocks: NoteBlock[]) => void;
  onSyncToMarkdown?: () => void;
  onSendBlockToSticky?: (block: NoteBlock) => void;
  onSendBlockToCanvas?: (block: NoteBlock) => void;
}

const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'paragraph', label: 'Paragraf', icon: <FileText className="w-3.5 h-3.5" /> },
  { type: 'h1', label: 'Judul Besar (H1)', icon: <Heading1 className="w-3.5 h-3.5" /> },
  { type: 'h2', label: 'Subjudul (H2)', icon: <Heading2 className="w-3.5 h-3.5" /> },
  { type: 'todo', label: 'Item Tugas', icon: <CheckSquare className="w-3.5 h-3.5" /> },
  { type: 'callout', label: 'Sorotan Info', icon: <Info className="w-3.5 h-3.5" /> },
  { type: 'quote', label: 'Kutipan', icon: <Quote className="w-3.5 h-3.5" /> },
  { type: 'code', label: 'Blok Kode', icon: <Code className="w-3.5 h-3.5" /> },
  { type: 'table', label: 'Tabel Matriks', icon: <Table className="w-3.5 h-3.5" /> },
  { type: 'divider', label: 'Garis Pemisah', icon: <Minus className="w-3.5 h-3.5" /> },
];

export const BlockWikiEditor: React.FC<BlockWikiEditorProps> = ({
  blocks,
  onChange,
  onSyncToMarkdown,
  onSendBlockToSticky,
  onSendBlockToCanvas,
}) => {
  const updateBlock = (id: string, patch: Partial<NoteBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBlockAt = (index: number, type: BlockType = 'paragraph') => {
    const newBlock: NoteBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      content: '',
      calloutTitle: type === 'callout' ? 'Catatan Penting' : undefined,
      checked: type === 'todo' ? false : undefined,
      language: type === 'code' ? 'typescript' : undefined,
      tableData:
        type === 'table'
          ? [
              ['Kolom 1', 'Kolom 2', 'Status'],
              ['', '', ''],
            ]
          : undefined,
    };

    const next = [...blocks];
    next.splice(index + 1, 0, newBlock);
    onChange(next);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) {
      onChange([{ id: `blk-${Date.now()}`, type: 'paragraph', content: '' }]);
      return;
    }
    onChange(blocks.filter((b) => b.id !== id));
  };

  const duplicateBlock = (index: number) => {
    const target = blocks[index];
    if (!target) return;
    const copy: NoteBlock = {
      ...target,
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tableData: target.tableData ? target.tableData.map((r) => [...r]) : undefined,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const updateTableCell = (block: NoteBlock, rIdx: number, cIdx: number, val: string) => {
    if (!block.tableData) return;
    const nextTable = block.tableData.map((row, r) =>
      row.map((cell, c) => (r === rIdx && c === cIdx ? val : cell))
    );
    updateBlock(block.id, { tableData: nextTable });
  };

  const addTableRow = (block: NoteBlock) => {
    const current = block.tableData || [['Kolom 1', 'Kolom 2']];
    const cols = current[0]?.length || 2;
    const nextTable = [...current, Array(cols).fill('')];
    updateBlock(block.id, { tableData: nextTable });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Quick Insert & Cross-Layer Sync Bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-stone-200/80 dark:border-slate-800 bg-[#F3F1EC]/60 dark:bg-slate-900/60 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-stone-500 dark:text-slate-400 mr-1 whitespace-nowrap shrink-0">
            + Blok:
          </span>
          {BLOCK_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => addBlockAt(blocks.length - 1, opt.type)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-stone-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-stone-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors whitespace-nowrap shrink-0"
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSyncToMarkdown && (
            <button
              type="button"
              onClick={onSyncToMarkdown}
              title="Salin & sinkronkan seluruh Blok Wiki ini ke bagian Markdown catatan ini"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sinkron → Markdown</span>
            </button>
          )}
          <span className="text-xs font-mono-tabular text-stone-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            {blocks.length} blok
          </span>
        </div>
      </div>

      {/* Blocks Canvas */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="max-w-3xl mx-auto space-y-3">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className="group relative rounded-xl border border-stone-200/80 dark:border-slate-800/90 bg-white/80 dark:bg-slate-900/70 p-4 transition-colors hover:border-stone-300 dark:hover:border-slate-700"
            >
              {/* Block Header Controls + Cross-Mode Send Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-stone-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tabular text-[11px] text-stone-400 dark:text-slate-500">
                    #{index + 1}
                  </span>
                  <select
                    value={block.type}
                    onChange={(e) =>
                      updateBlock(block.id, { type: e.target.value as BlockType })
                    }
                    className="text-xs font-medium bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 rounded-md px-2 py-1 border border-stone-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {BLOCK_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.type} value={opt.type}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  {onSendBlockToSticky && block.type !== 'divider' && (
                    <button
                      type="button"
                      onClick={() => onSendBlockToSticky(block)}
                      title="Kirim blok ini menjadi Kartu di Papan Sticky catatan ini"
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors whitespace-nowrap"
                    >
                      <LayoutGrid className="w-3 h-3" />
                      <span>+ Sticky</span>
                    </button>
                  )}
                  {onSendBlockToCanvas && block.type !== 'divider' && (
                    <button
                      type="button"
                      onClick={() => onSendBlockToCanvas(block)}
                      title="Kirim blok ini menjadi Node di Kanvas Visual catatan ini"
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                      <Network className="w-3 h-3" />
                      <span>+ Kanvas</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    title="Geser ke Atas"
                    className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    title="Geser ke Bawah"
                    className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateBlock(index)}
                    title="Duplikat Blok"
                    className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlockAt(index, 'paragraph')}
                    title="Sisipkan Blok di Bawah"
                    className="p-1 rounded text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    title="Hapus Blok"
                    className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Block Body by Type */}
              {block.type === 'h1' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Ketik judul utama bagian..."
                  className="w-full text-2xl font-bold tracking-tight bg-transparent text-stone-900 dark:text-white focus:outline-none"
                />
              )}

              {block.type === 'h2' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Ketik subjudul..."
                  className="w-full text-lg font-semibold tracking-tight bg-transparent text-stone-900 dark:text-slate-100 focus:outline-none"
                />
              )}

              {block.type === 'paragraph' && (
                <textarea
                  rows={Math.max(2, block.content.split('\n').length)}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  placeholder="Tulis paragraf dokumentasi atau penjelasan..."
                  className="w-full bg-transparent resize-y text-[15px] leading-relaxed text-stone-700 dark:text-slate-200 focus:outline-none"
                />
              )}

              {block.type === 'todo' && (
                <div className="flex items-start gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={Boolean(block.checked)}
                    onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Tulis item daftar periksa..."
                    className={`w-full bg-transparent text-[15px] focus:outline-none ${
                      block.checked
                        ? 'line-through text-stone-400 dark:text-slate-500'
                        : 'text-stone-800 dark:text-slate-200'
                    }`}
                  />
                </div>
              )}

              {block.type === 'callout' && (
                <div className="rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 p-3.5 space-y-1.5">
                  <input
                    type="text"
                    value={block.calloutTitle || 'Sorotan Informasi'}
                    onChange={(e) =>
                      updateBlock(block.id, { calloutTitle: e.target.value })
                    }
                    className="w-full text-xs font-semibold text-indigo-900 dark:text-indigo-300 bg-transparent focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Tuliskan isi catatan sorotan..."
                    className="w-full bg-transparent resize-y text-sm text-indigo-950/90 dark:text-indigo-200 focus:outline-none"
                  />
                </div>
              )}

              {block.type === 'quote' && (
                <div className="rounded-lg bg-stone-100/80 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 p-3.5">
                  <textarea
                    rows={2}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Tuliskan kutipan atau prinsip utama..."
                    className="w-full bg-transparent resize-y italic text-[15px] text-stone-700 dark:text-slate-300 focus:outline-none"
                  />
                </div>
              )}

              {block.type === 'code' && (
                <div className="rounded-lg bg-stone-900 text-stone-100 p-3.5 font-mono-tabular text-xs">
                  <textarea
                    rows={Math.max(3, block.content.split('\n').length)}
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="// Tulis kode atau konfigurasi teknis..."
                    className="w-full bg-transparent resize-y text-stone-100 focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {block.type === 'table' && (
                <div className="space-y-2">
                  <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-sm">
                      <tbody>
                        {(
                          block.tableData || [
                            ['Kolom 1', 'Kolom 2'],
                            ['', ''],
                          ]
                        ).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={
                              rIdx === 0
                                ? 'bg-stone-100 dark:bg-slate-800 font-semibold border-b border-stone-200 dark:border-slate-700'
                                : 'border-b border-stone-200/60 dark:border-slate-800 last:border-b-0'
                            }
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="p-2 border-r border-stone-200/60 dark:border-slate-800 last:border-r-0"
                              >
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    updateTableCell(block, rIdx, cIdx, e.target.value)
                                  }
                                  placeholder={rIdx === 0 ? 'Judul Kolom' : 'Isi sel...'}
                                  className="w-full bg-transparent text-xs font-mono-tabular text-stone-800 dark:text-slate-200 focus:outline-none"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={() => addTableRow(block)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Tambah Baris Tabel
                  </button>
                </div>
              )}

              {block.type === 'divider' && (
                <div className="py-3">
                  <hr className="border-stone-300 dark:border-slate-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
