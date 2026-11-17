import React, { useMemo, useRef, useState } from 'react';
import {
  Bold,
  CheckSquare,
  Code,
  Columns,
  Eye,
  Heading1,
  Heading2,
  Italic,
  List,
  PenLine,
  Quote,
  Table,
  Type,
} from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onChange: (nextContent: string) => void;
}

type EditorSubView = 'split' | 'edit' | 'preview';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content, onChange }) => {
  const [subView, setSubView] = useState<EditorSubView>('split');
  const [useSerif, setUseSerif] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingMinutes };
  }, [content]);

  const insertFormatting = (prefix: string, suffix = '', placeholder = 'teks') => {
    const el = textareaRef.current;
    if (!el) {
      onChange(`${content}\n${prefix}${placeholder}${suffix}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const nextText =
      content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    onChange(nextText);
    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const toggleCheckboxLine = (lineIndex: number) => {
    const lines = content.split('\n');
    const target = lines[lineIndex];
    if (!target) return;
    if (/^\s*-\s*\[ \]\s+/.test(target)) {
      lines[lineIndex] = target.replace('[ ]', '[x]');
    } else if (/^\s*-\s*\[[xX]\]\s+/.test(target)) {
      lines[lineIndex] = target.replace(/\[[xX]\]/, '[ ]');
    }
    onChange(lines.join('\n'));
  };

  const formatInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={idx}
            className="font-mono-tabular text-[13px] px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-stone-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const renderPreview = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim() || 'kode';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <div
            key={`code-${i}`}
            className="my-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-900 text-stone-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800 text-xs font-mono-tabular text-stone-400">
              <span>{lang}</span>
              <span>{codeLines.length} baris</span>
            </div>
            <pre className="p-4 text-xs font-mono-tabular overflow-x-auto leading-relaxed">
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        i++;
        continue;
      }

      // Markdown table
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
        const headers = line
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].includes('|')) {
          rows.push(
            lines[i]
              .split('|')
              .map((c) => c.trim())
              .filter(Boolean)
          );
          i++;
        }
        elements.push(
          <div
            key={`table-${i}`}
            className="my-4 overflow-x-auto rounded-xl border border-stone-200 dark:border-slate-800"
          >
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-100/80 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800">
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      className="px-4 py-2.5 font-semibold text-stone-800 dark:text-slate-200"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                {rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-stone-100/50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-2.5 text-stone-700 dark:text-slate-300 font-mono-tabular"
                      >
                        {formatInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={i}
            className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-6 mb-3"
          >
            {line.slice(2)}
          </h1>
        );
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={i}
            className="text-lg font-semibold tracking-tight text-stone-900 dark:text-slate-100 mt-6 mb-2.5 pb-1.5 border-b border-stone-200/80 dark:border-slate-800"
          >
            {line.slice(3)}
          </h2>
        );
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={i}
            className="text-base font-semibold text-stone-800 dark:text-slate-200 mt-4 mb-1.5"
          >
            {line.slice(4)}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquote (subtle all-around border, no thick left stripe)
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={i}
            className="my-4 p-4 rounded-xl bg-stone-100/80 dark:bg-slate-900/80 border border-stone-200/90 dark:border-slate-800 text-stone-700 dark:text-slate-300 italic"
          >
            {formatInline(line.slice(2))}
          </blockquote>
        );
        i++;
        continue;
      }

      // Interactive Checklist
      const todoMatch = line.match(/^\s*-\s*\[([ xX])\]\s+(.*)$/);
      if (todoMatch) {
        const isChecked = todoMatch[1].toLowerCase() === 'x';
        const lineIdx = i;
        elements.push(
          <label
            key={i}
            onClick={() => toggleCheckboxLine(lineIdx)}
            className="flex items-start gap-3 py-1.5 cursor-pointer group select-none"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {}}
              className="mt-1 h-4 w-4 rounded border-stone-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span
              className={`text-[15px] leading-relaxed transition-colors ${
                isChecked
                  ? 'line-through text-stone-400 dark:text-slate-500'
                  : 'text-stone-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
              }`}
            >
              {formatInline(todoMatch[2])}
            </span>
          </label>
        );
        i++;
        continue;
      }

      // Bullet list
      if (/^\s*[-*]\s+/.test(line)) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 py-1 pl-1">
            <span className="text-stone-400 dark:text-slate-500 select-none">•</span>
            <span className="text-[15px] leading-relaxed text-stone-700 dark:text-slate-300">
              {formatInline(line.replace(/^\s*[-*]\s+/, ''))}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Numbered list
      const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 py-1 pl-1">
            <span className="font-mono-tabular text-xs font-medium text-stone-400 dark:text-slate-500 mt-1 select-none">
              {numMatch[1]}.
            </span>
            <span className="text-[15px] leading-relaxed text-stone-700 dark:text-slate-300">
              {formatInline(numMatch[2])}
            </span>
          </div>
        );
        i++;
        continue;
      }

      // Blank line
      if (!line.trim()) {
        elements.push(<div key={i} className="h-3" />);
        i++;
        continue;
      }

      // Default paragraph
      elements.push(
        <p
          key={i}
          className="text-[15px] leading-relaxed text-stone-700 dark:text-slate-300 my-1.5"
        >
          {formatInline(line)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Formatting & View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-b border-stone-200/80 dark:border-slate-800 bg-[#F3F1EC]/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => insertFormatting('# ', '', 'Judul Utama')}
            title="Heading 1"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', 'Subjudul Bagian')}
            title="Heading 2"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <span className="h-4 w-px bg-stone-300 dark:bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'teks tebal')}
            title="Tebal (Bold)"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'teks miring')}
            title="Miring (Italic)"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ', '', 'Kutipan penting')}
            title="Kutipan"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Quote className="w-4 h-4" />
          </button>
          <span className="h-4 w-px bg-stone-300 dark:bg-slate-700 mx-1" />
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', 'Butir daftar')}
            title="Daftar Butir"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- [ ] ', '', 'Item tugas baru')}
            title="Checklist Interaktif"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '\n| Kolom A | Kolom B | Status |\n| :--- | :--- | :--- |\n| Data 1 | Nilai 1 | Aktif |\n',
                '',
                ''
              )
            }
            title="Sisipkan Tabel Markdown"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n```typescript\n', '\n```\n', '// tulis kode di sini')}
            title="Blok Kode"
            className="p-1.5 rounded-md text-stone-600 dark:text-slate-300 hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Serif / Sans Editorial Toggle */}
          <button
            type="button"
            onClick={() => setUseSerif(!useSerif)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              useSerif
                ? 'bg-indigo-600 text-white'
                : 'text-stone-600 dark:text-slate-400 hover:bg-stone-200/70 dark:hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{useSerif ? 'Tipografi Serif' : 'Tipografi Sans'}</span>
          </button>

          {/* Segmented View Controls */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-stone-200/70 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setSubView('edit')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                subView === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Tulis</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                subView === 'split'
                  ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Berdampingan</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                subView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-slate-400 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor + Preview Split Area */}
      <div
        className={`flex-1 grid overflow-hidden ${
          subView === 'split' ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80 dark:divide-slate-800' : 'grid-cols-1'
        }`}
      >
        {(subView === 'edit' || subView === 'split') && (
          <div className="flex flex-col h-full overflow-hidden">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Mulai menulis dengan Markdown... Gunakan # untuk judul, - [ ] untuk daftar tugas, atau ``` untuk kode."
              className={`w-full flex-1 p-6 bg-transparent resize-none focus:outline-none text-[15px] leading-relaxed text-stone-800 dark:text-slate-200 placeholder:text-stone-400 dark:placeholder:text-slate-500 overflow-y-auto ${
                useSerif ? 'font-serif-editorial text-[16px]' : ''
              }`}
            />
          </div>
        )}

        {(subView === 'preview' || subView === 'split') && (
          <div
            className={`h-full overflow-y-auto p-6 bg-[#FAF9F5]/50 dark:bg-slate-950/40 ${
              useSerif ? 'font-serif-editorial' : ''
            }`}
          >
            <div className="max-w-[70ch] mx-auto">{renderPreview()}</div>
          </div>
        )}
      </div>

      {/* Quiet Editorial Status Footer */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-stone-200/80 dark:border-slate-800 text-xs text-stone-500 dark:text-slate-400 font-mono-tabular">
        <div className="flex items-center gap-2">
          <span>{stats.words} kata</span>
          <span aria-hidden="true">·</span>
          <span>{stats.chars} karakter</span>
          <span aria-hidden="true">·</span>
          <span>Estimasi baca {stats.readingMinutes} mnt</span>
        </div>
        <div>Klik kotak tugas pada Pratinjau untuk mencentang langsung</div>
      </div>
    </div>
  );
};
