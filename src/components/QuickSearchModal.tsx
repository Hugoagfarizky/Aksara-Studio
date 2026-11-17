import React, { useEffect, useMemo, useState } from 'react';
import { FileText, FolderIcon, Search, X } from 'lucide-react';
import { Folder, Note, NoteMode } from '../types/note';

interface QuickSearchModalProps {
  isOpen: boolean;
  notes: Note[];
  folders: Folder[];
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  onCreateNoteWithMode: (mode: NoteMode) => void;
}

const MODE_NAMES: Record<NoteMode, string> = {
  markdown: 'Markdown',
  blocks: 'Blok Wiki',
  sticky: 'Sticky Notes',
  canvas: 'Kanvas Visual',
};

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  notes,
  folders,
  onClose,
  onSelectNote,
  onCreateNoteWithMode,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const matchedNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes.slice(0, 8);
    return notes.filter((n) => {
      const inTitle = n.title.toLowerCase().includes(q);
      const inMd = n.markdownContent.toLowerCase().includes(q);
      const inTags = n.tags.some((t) => t.toLowerCase().includes(q));
      const inBlocks = n.blocks.some((b) => b.content.toLowerCase().includes(q));
      const inSticky = n.stickyCards.some(
        (s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q)
      );
      return inTitle || inMd || inTags || inBlocks || inSticky;
    });
  }, [notes, query]);

  if (!isOpen) return null;

  const getFolderName = (folderId: string | null) => {
    if (!folderId) return 'Tanpa Folder';
    return folders.find((f) => f.id === folderId)?.name || 'Tanpa Folder';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul catatan, isi dokumen, blok wiki, kartu sticky, atau #tag..."
            className="w-full text-sm bg-transparent text-stone-900 dark:text-white focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/70">
          {matchedNotes.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500 dark:text-slate-400">
              Tidak ditemukan catatan yang cocok dengan &quot;{query}&quot;
            </div>
          ) : (
            matchedNotes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  onSelectNote(note.id);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-medium text-sm text-stone-900 dark:text-white truncate">
                      {note.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mt-1 pl-6 font-mono-tabular">
                    <span className="inline-flex items-center gap-1">
                      <FolderIcon className="w-3 h-3" />
                      {getFolderName(note.folderId)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{MODE_NAMES[note.mode]}</span>
                    {note.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>#{note.tags.join(' #')}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs font-mono-tabular text-stone-400 shrink-0">
                  {new Date(note.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Quick Create Footer */}
        <div className="px-4 py-2.5 bg-stone-50 dark:bg-slate-950/60 border-t border-stone-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-stone-500 dark:text-slate-400">Buat cepat:</span>
          <div className="flex items-center gap-1.5">
            {(['markdown', 'blocks', 'sticky', 'canvas'] as NoteMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onCreateNoteWithMode(m);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-200 hover:border-indigo-500 transition-colors whitespace-nowrap"
              >
                + {MODE_NAMES[m]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
