import { Folder, Note, NoteTemplate, TagItem } from '../types/note';

export const INITIAL_FOLDERS: Folder[] = [];

export const INITIAL_TAGS: TagItem[] = [];

export const INITIAL_NOTES: Note[] = [];

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'tpl-meeting',
    name: 'Notulen Rapat & Tindak Lanjut',
    category: 'Produktivitas Tim',
    description:
      'Struktur rapat dengan daftar hadir, pokok bahasan, keputusan kunci, dan daftar tindak lanjut.',
    defaultMode: 'markdown',
    tags: [],
    buildNote: () => ({
      title: `Notulen Rapat — ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`,
      folderId: null,
      tags: [],
      isPinned: false,
      mode: 'markdown',
      markdownContent: `# Notulen Rapat\n\n## Informasi Rapat\n- **Tanggal**: ${new Date().toLocaleDateString(
        'id-ID',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      )}\n- **Peserta**: \n\n## 1. Agenda Utama\n1. \n\n## 2. Keputusan Kunci\n> \n\n## 3. Tindak Lanjut\n- [ ] `,
      blocks: [{ id: `tb-${Date.now()}`, type: 'h1', content: 'Notulen Rapat' }],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    }),
  },
  {
    id: 'tpl-journal',
    name: 'Jurnal Fokus Harian',
    category: 'Pribadi & Fokus',
    description:
      'Templat harian untuk mencatat prioritas utama, catatan hari ini, dan refleksi.',
    defaultMode: 'markdown',
    tags: [],
    buildNote: () => ({
      title: `Jurnal Harian — ${new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      folderId: null,
      tags: [],
      isPinned: false,
      mode: 'markdown',
      markdownContent: `# Jurnal Harian\n\n## Prioritas Hari Ini\n- [ ] \n\n## Catatan\n\n## Refleksi\n`,
      blocks: [],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    }),
  },
  {
    id: 'tpl-wiki-spec',
    name: 'Dokumen Blok Wiki',
    category: 'Dokumentasi',
    description:
      'Kerangka dokumen berbasis blok modular dengan judul, sorotan info, tabel, dan daftar periksa.',
    defaultMode: 'blocks',
    tags: [],
    buildNote: () => ({
      title: 'Dokumen Wiki Baru',
      folderId: null,
      tags: [],
      isPinned: false,
      mode: 'blocks',
      markdownContent: '',
      blocks: [
        { id: `w-${Date.now()}-1`, type: 'h1', content: '' },
        {
          id: `w-${Date.now()}-2`,
          type: 'callout',
          calloutTitle: 'Ringkasan',
          content: '',
        },
        { id: `w-${Date.now()}-3`, type: 'paragraph', content: '' },
      ],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    }),
  },
  {
    id: 'tpl-sticky-brainstorm',
    name: 'Papan Kartu Sticky Kosong',
    category: 'Kreatif & Ideasi',
    description: 'Papan kartu berwarna untuk mengumpulkan ide singkat dan pengingat.',
    defaultMode: 'sticky',
    tags: [],
    buildNote: () => ({
      title: 'Papan Sticky Baru',
      folderId: null,
      tags: [],
      isPinned: false,
      mode: 'sticky',
      markdownContent: '',
      blocks: [],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    }),
  },
  {
    id: 'tpl-canvas-map',
    name: 'Kanvas Visual Kosong',
    category: 'Visual & Pemetaan',
    description: 'Kanvas 2D bebas untuk memetakan konsep dan menggambar alur.',
    defaultMode: 'canvas',
    tags: [],
    buildNote: () => ({
      title: 'Kanvas Visual Baru',
      folderId: null,
      tags: [],
      isPinned: false,
      mode: 'canvas',
      markdownContent: '',
      blocks: [],
      stickyCards: [],
      canvasData: {
        nodes: [],
        connections: [],
        strokes: [],
      },
      checklist: [],
    }),
  },
];
