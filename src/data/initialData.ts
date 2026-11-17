import { Folder, Note, NoteTemplate, TagItem } from '../types/note';

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'fld-work',
    name: 'Pekerjaan & Proyek',
    parentId: null,
    createdAt: '2026-11-10T08:00:00.000Z',
  },
  {
    id: 'fld-product',
    name: 'Riset Produk',
    parentId: 'fld-work',
    createdAt: '2026-11-10T08:05:00.000Z',
  },
  {
    id: 'fld-meetings',
    name: 'Notulen Rapat',
    parentId: 'fld-work',
    createdAt: '2026-11-10T08:10:00.000Z',
  },
  {
    id: 'fld-wiki',
    name: 'Basis Pengetahuan Wiki',
    parentId: null,
    createdAt: '2026-11-11T09:00:00.000Z',
  },
  {
    id: 'fld-personal',
    name: 'Jurnal & Ide Kreatif',
    parentId: null,
    createdAt: '2026-11-12T10:00:00.000Z',
  },
  {
    id: 'fld-reading',
    name: 'Ringkasan Buku & Artikel',
    parentId: 'fld-personal',
    createdAt: '2026-11-12T10:15:00.000Z',
  },
];

export const INITIAL_TAGS: TagItem[] = [
  { id: 'tag-strategi', name: 'Strategi', colorKey: 'indigo' },
  { id: 'tag-riset', name: 'Riset', colorKey: 'sky' },
  { id: 'tag-prioritas', name: 'Prioritas', colorKey: 'rose' },
  { id: 'tag-ide', name: 'Ide Kilat', colorKey: 'amber' },
  { id: 'tag-wiki', name: 'Dokumentasi', colorKey: 'emerald' },
  { id: 'tag-jurnal', name: 'Jurnal', colorKey: 'violet' },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Strategi Peluncuran Ekosistem Produk Q4',
    folderId: 'fld-product',
    tags: ['Strategi', 'Prioritas'],
    isPinned: true,
    mode: 'markdown',
    createdAt: '2026-11-14T09:30:00.000Z',
    updatedAt: '2026-11-17T08:45:00.000Z',
    markdownContent: `# Strategi Peluncuran Ekosistem Produk Q4

Dokumen ini merangkum rencana eksekusi peluncuran pembaruan platform generasi keempat, mencakup target metrik pengguna, kesiapan infrastruktur, dan jadwal komunikasi publik.

> Fokus utama kuartal ini adalah menyederhanakan alur kerja pengguna baru sehingga waktu dari pendaftaran hingga dokumen pertama di bawah **45 detik**.

## 1. Sasaran Kinerja Utama (OKR)

| Indikator Utama | Target Q3 | Target Q4 | Penanggung Jawab |
| :--- | :--- | :--- | :--- |
| Retensi Hari ke-30 | 42.5% | 58.0% | Tim Produk Inti |
| Waktu Muat Editor | 620 ms | 180 ms | Tim Rekayasa Web |
| Konversi Templat Aktif | 28.0% | 45.0% | Tim Pertumbuhan |

## 2. Daftar Periksa Kesiapan Rilis

- [x] Audit aksesibilitas kontras warna WCAG AA di seluruh komponen
- [x] Pengujian penyimpanan lokal luring dan ekspor cadangan JSON
- [ ] Finalisasi materi panduan interaktif untuk pengguna baru
- [ ] Sesi tinjauan desain akhir bersama tim editorial

## 3.Konfigurasi Lingkungan Rilis

\`\`\`json
{
  "releaseChannel": "production-stable",
  "offlinePersistence": true,
  "SupportedModes": ["markdown", "blocks", "sticky", "canvas"],
  "autosaveIntervalMs": 300
}
\`\`\`

## 4. Catatan Tambahan Rapat Lintas Tim

Pastikan setiap perubahan skema dokumen memiliki migrasi mundur otomatis agar catatan lama di perangkat pengguna tetap terbaca sempurna tanpa kehilangan format.`,
    blocks: [
      {
        id: 'b-101',
        type: 'h1',
        content: 'Strategi Peluncuran Ekosistem Produk Q4',
      },
      {
        id: 'b-102',
        type: 'callout',
        calloutTitle: 'Prinsip Utama Rilis',
        content:
          'Fokus utama kuartal ini adalah menyederhanakan alur kerja pengguna baru hingga di bawah 45 detik.',
      },
      {
        id: 'b-103',
        type: 'paragraph',
        content:
          'Dokumen ini dapat disunting baik dalam mode Markdown maupun mode Blok Wiki terstruktur.',
      },
    ],
    stickyCards: [
      {
        id: 'sc-101',
        title: 'Sorotan Metrik Q4',
        body: 'Target waktu muat editor di bawah 180 ms pada jaringan standar.',
        tone: 'amber',
        pinned: true,
        updatedAt: '2026-11-17T08:00:00.000Z',
      },
    ],
    canvasData: {
      nodes: [
        {
          id: 'cn-101',
          x: 80,
          y: 90,
          width: 240,
          title: 'Riset Pengguna',
          content: 'Wawancara 24 penulis & analis produk mengenai hambatan mencatat cepat.',
          tone: 'indigo',
        },
        {
          id: 'cn-102',
          x: 420,
          y: 90,
          width: 240,
          title: 'Peluncuran Q4',
          content: 'Integrasi 4 mode pencatatan dalam satu ruang kerja lokal.',
          tone: 'emerald',
        },
      ],
      connections: [
        {
          id: 'cc-101',
          fromId: 'cn-101',
          toId: 'cn-102',
          label: 'Validasi Fitur',
        },
      ],
      strokes: [],
    },
    checklist: [
      {
        id: 'chk-1',
        text: 'Selesaikan pengujian ekspor/impor file cadangan JSON',
        completed: true,
        dueDate: '2026-11-16',
        priority: 'high',
      },
      {
        id: 'chk-2',
        text: 'Susun daftar templat bawaan untuk tim produk dan kreatif',
        completed: true,
        dueDate: '2026-11-17',
        priority: 'normal',
      },
      {
        id: 'chk-3',
        text: 'Lakukan tinjauan performa kanvas bebas pada layar resolusi tinggi',
        completed: false,
        dueDate: '2026-11-19',
        priority: 'high',
      },
      {
        id: 'chk-4',
        text: 'Siapkan dokumentasi pintasan papan ketik (Cmd+K)',
        completed: false,
        dueDate: '2026-11-21',
        priority: 'normal',
      },
    ],
  },
  {
    id: 'note-2',
    title: 'Panduan Arsitektur & Standar Dokumentasi Wiki',
    folderId: 'fld-wiki',
    tags: ['Dokumentasi', 'Riset'],
    isPinned: true,
    mode: 'blocks',
    createdAt: '2026-11-15T11:20:00.000Z',
    updatedAt: '2026-11-17T07:15:00.000Z',
    markdownContent: `# Panduan Arsitektur & Standar Dokumentasi Wiki\n\nSistem blok modular memudahkan penyusunan dokumentasi teknis, SOP tim, dan panduan kerja.`,
    blocks: [
      {
        id: 'blk-1',
        type: 'h1',
        content: 'Standar Dokumentasi & Basis Pengetahuan Internal',
      },
      {
        id: 'blk-2',
        type: 'callout',
        calloutTitle: 'Panduan Penggunaan Mode Blok Wiki',
        content:
          'Setiap bagian di bawah ini adalah blok independen. Anda dapat mengubah tipe blok, menggeser urutan ke atas/bawah, atau menyisipkan blok baru di antara paragraf.',
      },
      {
        id: 'blk-3',
        type: 'h2',
        content: '1. Struktur Modul Penyimpanan Lokal',
      },
      {
        id: 'blk-4',
        type: 'paragraph',
        content:
          'Seluruh perubahan dokumen disimpan langsung ke penyimpanan lokal peramban dengan serialisasi JSON terstruktur. Pendekatan ini menjamin privasi penuh dan aksesibilitas instan bahkan saat perangkat tidak terhubung ke internet.',
      },
      {
        id: 'blk-5',
        type: 'table',
        content: 'Matriks Komponen Ruang Kerja',
        tableData: [
          ['Modul Ruang Kerja', 'Kegunaan Utama', 'Format Data'],
          ['Editor Markdown', 'Artikel panjang & laporan teknis', 'String Markdown + GFM'],
          ['Blok Wiki', 'SOP terstruktur & dokumentasi modul', 'Array Objek Blok Modular'],
          ['Papan Sticky', 'Ide kilat, pengingat, & kurasi cepat', 'Grid Kartu Berwarna'],
          ['Kanvas Visual', 'Pemetaan pikiran & diagram alur bebas', 'Node Koordinat + Vektor'],
        ],
      },
      {
        id: 'blk-6',
        type: 'h2',
        content: '2. Daftar Periksa Standar Kualitas Dokumen',
      },
      {
        id: 'blk-7',
        type: 'todo',
        content: 'Gunakan judul ringkas yang menjelaskan inti keputusan dokumen',
        checked: true,
      },
      {
        id: 'blk-8',
        type: 'todo',
        content: 'Tambahkan minimal satu label tag kategori untuk memudahkan pencarian',
        checked: true,
      },
      {
        id: 'blk-9',
        type: 'todo',
        content: 'Sertakan contoh kode atau tabel ringkasan pada spesifikasi teknis',
        checked: false,
      },
      {
        id: 'blk-10',
        type: 'code',
        language: 'typescript',
        content: `interface WorkspaceSnapshot {\n  version: string;\n  exportedAt: string;\n  notesCount: number;\n  foldersCount: number;\n}`,
      },
      {
        id: 'blk-11',
        type: 'quote',
        content:
          '"Dokumentasi yang baik bukan sekadar arsip pasif, melainkan ruang berpikir bersama yang terus bertumbuh."',
      },
    ],
    stickyCards: [],
    canvasData: { nodes: [], connections: [], strokes: [] },
    checklist: [
      {
        id: 'chk-201',
        text: 'Perbarui indeks panduan orientasi anggota tim baru',
        completed: false,
        dueDate: '2026-11-20',
        priority: 'normal',
      },
    ],
  },
  {
    id: 'note-3',
    title: 'Papan Ide Eksperimen & Catatan Kilat Mingguan',
    folderId: 'fld-personal',
    tags: ['Ide Kilat', 'Jurnal'],
    isPinned: false,
    mode: 'sticky',
    createdAt: '2026-11-16T14:00:00.000Z',
    updatedAt: '2026-11-17T06:40:00.000Z',
    markdownContent: `# Papan Ide Eksperimen & Catatan Kilat Mingguan\n\nKumpulan ide singkat yang ditempel dalam format kartu sticky notes.`,
    blocks: [
      {
        id: 'blk-301',
        type: 'h1',
        content: 'Papan Ide Eksperimen Mingguan',
      },
    ],
    stickyCards: [
      {
        id: 'stk-1',
        title: 'Mode Baca Tipografi Serif',
        body: 'Sediakan tombol pengubah font antara Sans modern dan Serif editorial agar nyaman saat membaca esai panjang di malam hari.',
        tone: 'amber',
        pinned: true,
        updatedAt: '2026-11-17T06:30:00.000Z',
      },
      {
        id: 'stk-2',
        title: 'Kutipan Buku: Desain Tenang',
        body: 'Alat terbaik adalah alat yang menghilang saat digunakan—memberi ruang bagi pikiran, bukan mendistraksi dengan ornamen.',
        tone: 'emerald',
        pinned: true,
        updatedAt: '2026-11-16T19:15:00.000Z',
      },
      {
        id: 'stk-3',
        title: 'Topik Artikel Pekan Depan',
        body: '1. Mengapa catatan lokal lebih cepat\n2. Cara menggabungkan metode Zettelkasten dengan papan visual\n3. Manajemen fokus tanpa notifikasi.',
        tone: 'sky',
        pinned: false,
        updatedAt: '2026-11-16T15:20:00.000Z',
      },
      {
        id: 'stk-4',
        title: 'Agenda Diskusi Desain Jumat',
        body: 'Bahas rasio kontras mode gelap dan uji coba fitur ekspor catatan ke berkas Markdown mandiri.',
        tone: 'rose',
        pinned: false,
        updatedAt: '2026-11-16T11:10:00.000Z',
      },
      {
        id: 'stk-5',
        title: 'Ide Pintasan Keyboard',
        body: 'Tekan Cmd/Ctrl + K dari mana saja untuk langsung melompat ke catatan, memfilter tag, atau membuat dokumen baru.',
        tone: 'violet',
        pinned: false,
        updatedAt: '2026-11-15T18:05:00.000Z',
      },
      {
        id: 'stk-6',
        title: 'Target Kebiasaan Menulis',
        body: 'Luangkan 15 menit setiap pagi sebelum membuka pesan masuk untuk merangkum 3 prioritas utama hari itu.',
        tone: 'stone',
        pinned: false,
        updatedAt: '2026-11-15T08:00:00.000Z',
      },
    ],
    canvasData: { nodes: [], connections: [], strokes: [] },
    checklist: [
      {
        id: 'chk-301',
        text: 'Pilih 2 ide terbaik dari papan sticky untuk dikembangkan menjadi artikel utuh',
        completed: false,
        dueDate: '2026-11-18',
        priority: 'high',
      },
    ],
  },
  {
    id: 'note-4',
    title: 'Peta Konsep & Alur Arsitektur Informasi',
    folderId: 'fld-product',
    tags: ['Riset', 'Strategi'],
    isPinned: false,
    mode: 'canvas',
    createdAt: '2026-11-16T16:45:00.000Z',
    updatedAt: '2026-11-17T09:10:00.000Z',
    markdownContent: `# Peta Konsep & Alur Arsitektur Informasi\n\nPemetaan visual hubungan antar-modul di atas kanvas bebas.`,
    blocks: [],
    stickyCards: [],
    canvasData: {
      nodes: [
        {
          id: 'node-1',
          x: 60,
          y: 70,
          width: 250,
          title: '1. Tangkapan Ide Cepat',
          content:
            'Masukan ide mendadak melalui Kartu Sticky atau catatan suara/teks singkat tanpa memikirkan struktur.',
          tone: 'amber',
        },
        {
          id: 'node-2',
          x: 390,
          y: 60,
          width: 260,
          title: '2. Pemetaan Spasial Kanvas',
          content:
            'Susun kartu-kartu ide di atas kanvas 2D, tarik garis penghubung sebab-akibat, dan tambahkan sketsa bebas.',
          tone: 'indigo',
        },
        {
          id: 'node-3',
          x: 390,
          y: 250,
          width: 260,
          title: '3. Strukturisasi Blok Wiki',
          content:
            'Ubah hasil pemetaan menjadi kerangka kerja terstruktur dengan tabel matriks, blok kode, dan daftar periksa.',
          tone: 'emerald',
        },
        {
          id: 'node-4',
          x: 730,
          y: 150,
          width: 260,
          title: '4. Naskah Akhir & Publikasi',
          content:
            'Sempurnakan dalam Editor Markdown dengan mode baca serif dan unduh sebagai dokumen .md siap kirim.',
          tone: 'rose',
        },
      ],
      connections: [
        {
          id: 'conn-1',
          fromId: 'node-1',
          toId: 'node-2',
          label: 'Eksplorasi Visual',
        },
        {
          id: 'conn-2',
          fromId: 'node-1',
          toId: 'node-3',
          label: 'Kategorisasi',
        },
        {
          id: 'conn-3',
          fromId: 'node-2',
          toId: 'node-4',
          label: 'Sintesis Naskah',
        },
        {
          id: 'conn-4',
          fromId: 'node-3',
          toId: 'node-4',
          label: 'Finalisasi',
        },
      ],
      strokes: [],
    },
    checklist: [
      {
        id: 'chk-401',
        text: 'Presentasikan alur 4 tahap pencatatan ke tim desain',
        completed: true,
        dueDate: '2026-11-17',
        priority: 'normal',
      },
    ],
  },
];

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'tpl-meeting',
    name: 'Notulen Rapat & Tindak Lanjut',
    category: 'Produktivitas Tim',
    description:
      'Struktur rapat lengkap dengan daftar hadir, pokok bahasan, keputusan kunci, dan item tindakan terukur.',
    defaultMode: 'markdown',
    tags: ['Strategi', 'Prioritas'],
    buildNote: () => ({
      title: `Notulen Rapat — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      folderId: 'fld-meetings',
      tags: ['Strategi', 'Prioritas'],
      isPinned: false,
      mode: 'markdown',
      markdownContent: `# Notulen Rapat Koordinasi

## Informasi Rapat
- **Tanggal**: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- **Fasilitator**: 
- **Peserta**: 

## 1. Tujuan & Agenda Utama
1. Meninjau capaian metrik pekan berjalan
2. Menyepakati prioritas pengembangan pekan depan
3. Mengidentifikasi hambatan lintas fungsi

## 2. Ringkasan Keputusan Kunci
> Tuliskan keputusan paling penting yang disepakati bersama dalam rapat ini.

| Topik Bahasan | Keputusan Akhir | Pemilik Tugas | Tenggat |
| :--- | :--- | :--- | :--- |
| Pembaruan Antarmuka | Disetujui untuk tahap implementasi | Tim Desain | Jumat |
| Optimasi Penyimpanan | Gunakan penyimpanan lokal + JSON | Tim Teknis | Rabu |

## 3. Daftar Tindak Lanjut (Action Items)
- [ ] Bagikan ringkasan notulen ke seluruh pemangku kepentingan
- [ ] Jadwalkan sesi evaluasi teknis lanjutan`,
      blocks: [
        { id: 'tb-1', type: 'h1', content: 'Notulen Rapat Koordinasi' },
        { id: 'tb-2', type: 'paragraph', content: 'Ringkasan agenda dan keputusan rapat.' },
      ],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [
        {
          id: 'tc-1',
          text: 'Kirimkan salinan notulen rapat ke peserta',
          completed: false,
          priority: 'high',
        },
        {
          id: 'tc-2',
          text: 'Perbarui papan tugas sesuai hasil rapat',
          completed: false,
          priority: 'normal',
        },
      ],
    }),
  },
  {
    id: 'tpl-journal',
    name: 'Jurnal Refleksi & Fokus Harian',
    category: 'Pribadi & Fokus',
    description:
      'Templat harian untuk menetapkan 3 prioritas utama pagi hari, catatan rasa syukur, dan evaluasi sore.',
    defaultMode: 'markdown',
    tags: ['Jurnal'],
    buildNote: () => ({
      title: `Jurnal Harian — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      folderId: 'fld-personal',
      tags: ['Jurnal'],
      isPinned: false,
      mode: 'markdown',
      markdownContent: `# Jurnal Fokus & Refleksi Harian

> "Kejernihan pikiran lahir dari kebiasaan menuliskan apa yang benar-benar penting hari ini."

## Tiga Prioritas Utama Hari Ini
- [ ] Fokus mendalam selama 90 menit pada proyek utama
- [ ] Menyelesaikan tinjauan dokumen yang tertunda
- [ ] Olahraga ringan atau jalan sore selama 30 menit

## Catatan Ide & Observasi Siang Hari
Tuliskan gagasan spontan, kutipan menarik, atau pembelajaran yang ditemukan sepanjang hari...

## Refleksi Malam
1. **Hal yang berjalan sangat baik hari ini**: 
2. **Satu hal yang bisa diperbaiki esok hari**: `,
      blocks: [],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [
        {
          id: 'tc-j1',
          text: 'Selesaikan 1 sesi fokus mendalam tanpa gangguan',
          completed: false,
          priority: 'high',
        },
      ],
    }),
  },
  {
    id: 'tpl-wiki-spec',
    name: 'Spesifikasi Produk & Dokumen Wiki',
    category: 'Rekayasa & Produk',
    description:
      'Dokumen berbasis blok modular yang dilengkapi callout ringkasan, tabel spesifikasi, dan daftar periksa rilis.',
    defaultMode: 'blocks',
    tags: ['Dokumentasi', 'Riset'],
    buildNote: () => ({
      title: 'Spesifikasi Fitur Baru — Dokumen Wiki',
      folderId: 'fld-wiki',
      tags: ['Dokumentasi', 'Riset'],
      isPinned: false,
      mode: 'blocks',
      markdownContent: '# Spesifikasi Fitur Baru\n\nDisusun menggunakan sistem blok terstruktur.',
      blocks: [
        { id: 'w-1', type: 'h1', content: 'Spesifikasi Teknis & Produk (PRD)' },
        {
          id: 'w-2',
          type: 'callout',
          calloutTitle: 'Latar Belakang Masalah',
          content:
            'Jelaskan masalah utama pengguna yang ingin diselesaikan oleh fitur ini serta dampak yang diharapkan.',
        },
        { id: 'w-3', type: 'h2', content: '1. Cakupan Fitur & Kebutuhan Fungsional' },
        {
          id: 'w-4',
          type: 'table',
          content: 'Daftar Kebutuhan',
          tableData: [
            ['ID', 'Kebutuhan Fungsional', 'Prioritas', 'Status'],
            ['REQ-01', 'Alur input cepat tanpa reload halaman', 'Tinggi', 'Siap Uji'],
            ['REQ-02', 'Penyimpanan otomatis di browser lokal', 'Tinggi', 'Selesai'],
            ['REQ-03', 'Ekspor dokumen ke format Markdown', 'Sedang', 'Dalam Proses'],
          ],
        },
        { id: 'w-5', type: 'h2', content: '2. Kriteria Penerimaan (Acceptance Criteria)' },
        {
          id: 'w-6',
          type: 'todo',
          content: 'Semua interaksi tombol memiliki umpan balik visual di bawah 150ms',
          checked: false,
        },
        {
          id: 'w-7',
          type: 'todo',
          content: 'Tampilan responsif penuh pada layar desktop 1440px dan mobile',
          checked: false,
        },
      ],
      stickyCards: [],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [
        {
          id: 'tc-w1',
          text: 'Lengkapi tabel kebutuhan fungsional bersama tim teknis',
          completed: false,
          priority: 'high',
        },
      ],
    }),
  },
  {
    id: 'tpl-sticky-brainstorm',
    name: 'Sesi Brainstorming Papan Sticky',
    category: 'Kreatif & Ideasi',
    description:
      'Papan kartu berwarna untuk mengumpulkan ide liar, mengelompokkan umpan balik, dan memilih prioritas.',
    defaultMode: 'sticky',
    tags: ['Ide Kilat'],
    buildNote: () => ({
      title: 'Brainstorming Ide Kampanye & Fitur',
      folderId: 'fld-personal',
      tags: ['Ide Kilat'],
      isPinned: false,
      mode: 'sticky',
      markdownContent: '# Brainstorming Ide Kampanye & Fitur',
      blocks: [],
      stickyCards: [
        {
          id: 'bs-1',
          title: 'Ide Utama #1',
          body: 'Tulis gagasan inti di sini. Gunakan warna kuning amber untuk ide yang paling menjanjikan.',
          tone: 'amber',
          pinned: true,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bs-2',
          title: 'Masukan Pengguna',
          body: 'Kumpulkan kutipan atau kebutuhan pengguna yang sering muncul selama minggu ini.',
          tone: 'sky',
          pinned: false,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bs-3',
          title: 'Eksperimen Cepat',
          body: 'Hal kecil apa yang bisa kita bangun dan uji coba dalam waktu kurang dari 2 hari?',
          tone: 'emerald',
          pinned: false,
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'bs-4',
          title: 'Risiko & Tantangan',
          body: 'Catat potensi kendala teknis atau waktu agar bisa diantisipasi lebih awal.',
          tone: 'rose',
          pinned: false,
          updatedAt: new Date().toISOString(),
        },
      ],
      canvasData: { nodes: [], connections: [], strokes: [] },
      checklist: [],
    }),
  },
  {
    id: 'tpl-canvas-map',
    name: 'Peta Konsep & Diagram Alur Kanvas',
    category: 'Visual & Pemetaan',
    description:
      'Kanvas 2D bebas dengan node yang saling terhubung untuk merancang arsitektur, alur pengguna, atau peta pikiran.',
    defaultMode: 'canvas',
    tags: ['Riset', 'Ide Kilat'],
    buildNote: () => ({
      title: 'Peta Konsep Visual Baru',
      folderId: 'fld-product',
      tags: ['Riset', 'Ide Kilat'],
      isPinned: false,
      mode: 'canvas',
      markdownContent: '# Peta Konsep Visual Baru',
      blocks: [],
      stickyCards: [],
      canvasData: {
        nodes: [
          {
            id: 'tpl-n1',
            x: 100,
            y: 120,
            width: 240,
            title: 'Konsep Inti / Masalah',
            content: 'Klik untuk mengubah judul atau isi kartu ini. Geser ke posisi mana pun di kanvas.',
            tone: 'indigo',
          },
          {
            id: 'tpl-n2',
            x: 440,
            y: 60,
            width: 240,
            title: 'Cabang Solusi A',
            content: 'Pendekatan pertama yang dapat dieksplorasi oleh tim.',
            tone: 'emerald',
          },
          {
            id: 'tpl-n3',
            x: 440,
            y: 220,
            width: 240,
            title: 'Cabang Solusi B',
            content: 'Alternatif kedua dengan fokus efisiensi waktu.',
            tone: 'amber',
          },
        ],
        connections: [
          { id: 'tpl-c1', fromId: 'tpl-n1', toId: 'tpl-n2', label: 'Opsi 1' },
          { id: 'tpl-c2', fromId: 'tpl-n1', toId: 'tpl-n3', label: 'Opsi 2' },
        ],
        strokes: [],
      },
      checklist: [],
    }),
  },
];
