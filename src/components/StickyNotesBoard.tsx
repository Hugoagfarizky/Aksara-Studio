import React, { useMemo, useState } from 'react';
import {
  FileText,
  Layers,
  Network,
  Pin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { StickyCard, StickyTone } from '../types/note';

interface StickyNotesBoardProps {
  cards: StickyCard[];
  onChange: (nextCards: StickyCard[]) => void;
  onSendCardToCanvas?: (card: StickyCard) => void;
  onSendCardToBlocks?: (card: StickyCard) => void;
  onSendCardToMarkdown?: (card: StickyCard) => void;
  onSendAllToCanvas?: () => void;
  boardTitle?: string;
}

const TONE_STYLES: Record<
  StickyTone,
  { label: string; cardBg: string; border: string; dot: string }
> = {
  amber: {
    label: 'Kuning Amber',
    cardBg: 'bg-amber-50/90 dark:bg-amber-950/35',
    border: 'border-amber-200/90 dark:border-amber-800/70',
    dot: 'bg-amber-400',
  },
  emerald: {
    label: 'Hijau Sage',
    cardBg: 'bg-emerald-50/90 dark:bg-emerald-950/35',
    border: 'border-emerald-200/90 dark:border-emerald-800/70',
    dot: 'bg-emerald-500',
  },
  sky: {
    label: 'Biru Langit',
    cardBg: 'bg-sky-50/90 dark:bg-sky-950/35',
    border: 'border-sky-200/90 dark:border-sky-800/70',
    dot: 'bg-sky-500',
  },
  rose: {
    label: 'Mawar Lembut',
    cardBg: 'bg-rose-50/90 dark:bg-rose-950/35',
    border: 'border-rose-200/90 dark:border-rose-800/70',
    dot: 'bg-rose-500',
  },
  violet: {
    label: 'Ungu Lavender',
    cardBg: 'bg-violet-50/90 dark:bg-violet-950/35',
    border: 'border-violet-200/90 dark:border-violet-800/70',
    dot: 'bg-violet-500',
  },
  stone: {
    label: 'Kertas Netral',
    cardBg: 'bg-stone-100/90 dark:bg-slate-900/90',
    border: 'border-stone-200/90 dark:border-slate-800',
    dot: 'bg-stone-400',
  },
};

export const StickyNotesBoard: React.FC<StickyNotesBoardProps> = ({
  cards,
  onChange,
  onSendCardToCanvas,
  onSendCardToBlocks,
  onSendCardToMarkdown,
  onSendAllToCanvas,
  boardTitle,
}) => {
  const [toneFilter, setToneFilter] = useState<StickyTone | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNewTone, setSelectedNewTone] = useState<StickyTone>('amber');

  const addStickyCard = (tone: StickyTone = selectedNewTone) => {
    const newCard: StickyCard = {
      id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      body: '',
      tone,
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    onChange([newCard, ...cards]);
  };

  const updateCard = (id: string, patch: Partial<StickyCard>) => {
    onChange(
      cards.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const deleteCard = (id: string) => {
    onChange(cards.filter((c) => c.id !== id));
  };

  const filteredCards = useMemo(() => {
    return [...cards]
      .filter((c) => (toneFilter === 'all' ? true : c.tone === toneFilter))
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) || c.body.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [cards, toneFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Board Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-b border-stone-200/80 dark:border-slate-800 bg-[#F3F1EC]/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 flex-wrap">
          {boardTitle && (
            <span className="text-xs font-semibold text-stone-900 dark:text-white mr-1">
              {boardTitle}
            </span>
          )}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-stone-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setToneFilter('all')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                toneFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              Semua ({cards.length})
            </button>
            {(Object.keys(TONE_STYLES) as StickyTone[]).map((toneKey) => (
              <button
                key={toneKey}
                type="button"
                onClick={() => setToneFilter(toneKey)}
                title={TONE_STYLES[toneKey].label}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  toneFilter === toneKey
                    ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                    : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${TONE_STYLES[toneKey].dot}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSendAllToCanvas && cards.length > 0 && (
            <button
              type="button"
              onClick={onSendAllToCanvas}
              title="Kirim seluruh Kartu Sticky ini ke Kanvas Visual catatan ini"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Kirim Semua → Kanvas</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kartu..."
              className="pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
            />
          </div>

          <select
            value={selectedNewTone}
            onChange={(e) => setSelectedNewTone(e.target.value as StickyTone)}
            aria-label="Pilih warna kartu baru"
            className="text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-700 dark:text-slate-200 px-2 py-1.5 focus:outline-none"
          >
            {(Object.keys(TONE_STYLES) as StickyTone[]).map((t) => (
              <option key={t} value={t}>
                {TONE_STYLES[t].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => addStickyCard(selectedNewTone)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Kartu Sticky</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredCards.length === 0 ? (
          <div className="max-w-md mx-auto my-8 text-center p-6 rounded-2xl border border-dashed border-stone-300 dark:border-slate-800">
            <p className="text-sm font-medium text-stone-800 dark:text-slate-200 mb-1">
              Belum ada kartu sticky di catatan ini
            </p>
            <p className="text-xs text-stone-500 dark:text-slate-400 mb-4">
              Tambahkan kartu ide singkat, lalu kirimkan ke Kanvas Visual, Blok Wiki, atau Markdown kapan saja.
            </p>
            <button
              type="button"
              onClick={() => addStickyCard('amber')}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              + Tambah Kartu Sticky
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const style = TONE_STYLES[card.tone] || TONE_STYLES.stone;
              return (
                <div
                  key={card.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${style.cardBg} ${style.border}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(card.id, { title: e.target.value })}
                        placeholder="Judul kartu..."
                        className="w-full font-display font-semibold text-sm bg-transparent text-stone-900 dark:text-white focus:outline-none"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCard(card.id, { pinned: !card.pinned })}
                          title={card.pinned ? 'Lepas Sematan' : 'Sematkan di Atas'}
                          className={`p-1 rounded transition-colors ${
                            card.pinned
                              ? 'text-indigo-600 dark:text-indigo-400 bg-white/70 dark:bg-slate-800'
                              : 'text-stone-400 hover:text-stone-700 dark:hover:text-slate-200'
                          }`}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCard(card.id)}
                          title="Hapus Kartu"
                          className="p-1 rounded text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={card.body}
                      onChange={(e) => updateCard(card.id, { body: e.target.value })}
                      placeholder="Tuliskan gagasan atau poin penting..."
                      className="w-full bg-transparent resize-y text-xs leading-relaxed text-stone-700 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Cross-Layer Send Actions & Tone Selector */}
                  <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-[10px] text-stone-500 dark:text-slate-400 mr-1">
                        Kirim ke:
                      </span>
                      {onSendCardToCanvas && (
                        <button
                          type="button"
                          onClick={() => onSendCardToCanvas(card)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/80 dark:bg-slate-900/80 text-indigo-700 dark:text-indigo-300 border border-black/10 dark:border-white/10 hover:border-indigo-500 transition-colors whitespace-nowrap"
                        >
                          <Network className="w-2.5 h-2.5" />
                          <span>Kanvas</span>
                        </button>
                      )}
                      {onSendCardToBlocks && (
                        <button
                          type="button"
                          onClick={() => onSendCardToBlocks(card)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/80 dark:bg-slate-900/80 text-emerald-700 dark:text-emerald-300 border border-black/10 dark:border-white/10 hover:border-emerald-500 transition-colors whitespace-nowrap"
                        >
                          <Layers className="w-2.5 h-2.5" />
                          <span>Blok Wiki</span>
                        </button>
                      )}
                      {onSendCardToMarkdown && (
                        <button
                          type="button"
                          onClick={() => onSendCardToMarkdown(card)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white/80 dark:bg-slate-900/80 text-stone-700 dark:text-slate-300 border border-black/10 dark:border-white/10 hover:border-stone-500 transition-colors whitespace-nowrap"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>Markdown</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        {(Object.keys(TONE_STYLES) as StickyTone[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateCard(card.id, { tone: t })}
                            title={`Ubah ke ${TONE_STYLES[t].label}`}
                            className={`w-3 h-3 rounded-full transition-transform ${
                              TONE_STYLES[t].dot
                            } ${
                              card.tone === t
                                ? 'ring-2 ring-offset-1 ring-stone-700 dark:ring-white scale-110'
                                : 'opacity-65 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-mono-tabular text-[10px]">
                        {new Date(card.updatedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
