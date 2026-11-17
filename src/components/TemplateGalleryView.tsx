import React from 'react';
import { FilePlus2 } from 'lucide-react';
import { NOTE_TEMPLATES } from '../data/initialData';
import { NoteMode, NoteTemplate } from '../types/note';

interface TemplateGalleryViewProps {
  onApplyTemplate: (template: NoteTemplate) => void;
  onCreateBlankWithMode: (mode: NoteMode) => void;
}

const MODE_LABELS: Record<NoteMode, string> = {
  markdown: 'Editor Markdown',
  blocks: 'Sistem Blok Wiki',
  sticky: 'Papan Kartu Sticky',
  canvas: 'Kanvas Visual 2D',
};

export const TemplateGalleryView: React.FC<TemplateGalleryViewProps> = ({
  onApplyTemplate,
  onCreateBlankWithMode,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#FAF9F5] dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="pb-5 border-b border-stone-200 dark:border-slate-800">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
            Mulai Cepat dengan Struktur Siap Pakai
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            Galeri Templat & Mode Pencatatan
          </h1>
          <p className="text-sm text-stone-600 dark:text-slate-400 mt-1 max-w-2xl">
            Pilih salah satu dari 4 mode pencatatan kosong atau gunakan templat yang telah dirancang
            untuk rapat tim, jurnal refleksi, spesifikasi produk, hingga pemetaan kanvas visual.
          </p>
        </div>

        {/* 4 Core Modes Blank Starters */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-slate-100">
            01. Buat Dokumen Kosong Berdasarkan Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  mode: 'markdown',
                  title: 'Editor Teks & Markdown',
                  desc: 'Format dokumen panjang dengan pratinjau langsung, tabel, dan mode baca serif.',
                },
                {
                  mode: 'blocks',
                  title: 'Dokumen Blok Wiki',
                  desc: 'Susun pengetahuan secara modular dengan blok callout, kode, tabel, dan checklist.',
                },
                {
                  mode: 'sticky',
                  title: 'Papan Kartu Sticky',
                  desc: 'Tempelkan kartu catatan singkat berwarna untuk ide kilat dan pengingat harian.',
                },
                {
                  mode: 'canvas',
                  title: 'Kanvas Papan Tulis Visual',
                  desc: 'Petakan konsep di ruang 2D bebas dengan garis penghubung dan coretan pena.',
                },
              ] as { mode: NoteMode; title: string; desc: string }[]
            ).map((item) => (
              <div
                key={item.mode}
                className="flex flex-col justify-between rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
              >
                <div>
                  <h3 className="font-display font-semibold text-stone-900 dark:text-white text-sm mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCreateBlankWithMode(item.mode)}
                  className="mt-4 w-full py-2 px-3 rounded-lg text-xs font-medium bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-white hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors whitespace-nowrap"
                >
                  + Buka {MODE_LABELS[item.mode]}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Curated Templates Grid */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-slate-100">
            02. Templat Siap Pakai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NOTE_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="flex flex-col justify-between rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-stone-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Quiet 1-line unboxed metadata kicker */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 mb-1.5 font-mono-tabular">
                    <span>{tpl.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{MODE_LABELS[tpl.defaultMode]}</span>
                    {tpl.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>#{tpl.tags.join(' #')}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-display font-bold text-base text-stone-900 dark:text-white mb-1.5">
                    {tpl.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onApplyTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>Gunakan Templat Ini</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
