# Aksara Studio — Platform Catatan Digital Multi-Mode

**Aksara Studio** adalah ruang kerja catatan digital serbaguna yang menyatukan empat gaya pencatatan (**Editor Teks Kaya & Markdown**, **Dokumen Blok Terstruktur ala Wiki**, **Papan Kartu Sticky Notes**, dan **Kanvas Papan Tulis Visual 2D**) dalam satu antarmuka editorial yang tenang, cepat, dan tersimpan otomatis di perangkat lokal tanpa memerlukan login.

---

## Fitur Utama

### 1. Empat Mode Pencatatan Terpadu
Setiap catatan di Aksara Studio dapat dibuka atau dialihkan kapan saja ke salah satu dari 4 mode kerja:
- **Mode 1 — Editor Teks Kaya & Markdown**:
  - Toolbar pemformatan lengkap (Heading, Bold, Italic, Kutipan, Daftar Butir, Checklist, Tabel, dan Blok Kode).
  - Tiga mode tampilan: **Tulis**, **Berdampingan (Split View)**, dan **Pratinjau**.
  - Kotak centang (*checkbox*) interaktif yang dapat langsung diklik dari panel Pratinjau.
  - Pilihan peralihan tipografi antara **Sans Modern (`DM Sans`)** dan **Serif Editorial (`Source Serif 4`)** untuk kenyamanan membaca naskah panjang.
  - Penghitung jumlah kata, karakter, dan estimasi waktu baca secara *real-time*.
- **Mode 2 — Sistem Blok Terstruktur ala Wiki**:
  - Penyusunan dokumen per blok independen: *Judul Besar (H1)*, *Subjudul (H2)*, *Paragraf*, *Item Tugas*, *Sorotan Info (Callout)*, *Kutipan*, *Blok Kode*, *Tabel Matriks Interaktif*, dan *Garis Pemisah*.
  - Pengaturan urutan blok (geser ke atas/bawah), duplikasi blok, penyisipan blok di posisi mana pun, dan pengubahan tipe blok secara instan.
- **Mode 3 — Papan Kartu Sticky Notes**:
  - Grid kartu ide singkat dengan 6 pilihan warna kertas (*Kuning Amber*, *Hijau Sage*, *Biru Langit*, *Mawar Lembut*, *Ungu Lavender*, *Kertas Netral*).
  - Penyematan kartu penting (*Pin*) di urutan teratas, pencarian isi kartu, dan filter berdasarkan warna.
  - Tombol promosi satu klik untuk mengubah kartu *sticky note* menjadi dokumen catatan utuh.
- **Mode 4 — Kanvas Bebas & Papan Tulis Visual**:
  - Ruang kerja 2D interaktif untuk memetakan konsep dan alur sistem.
  - Fitur *drag-and-drop* posisi node kartu, pembuatan garis panah penghubung antar-node, serta mode gambar tangan bebas (*freehand sketch*) menggunakan pena warna-warni.
  - Kontrol perbesaran (*Zoom In / Zoom Out / Reset*).

### 2. Organisasi & Produktivitas
- **Folder & Sub-Folder Bertingkat**: Pengelompokan catatan dengan struktur pohon hierarki tanpa batas.
- **Label Tag Berwarna**: Penandaan lintas folder dengan indikator warna semantik.
- **Pencarian Cepat (`⌘K` / `Ctrl + K`)**: Palet pencarian instan yang memindai judul, isi Markdown, isi blok Wiki, kartu sticky, dan label tag.
- **Pusat Tugas Terpadu**: Halaman khusus yang mengumpulkan seluruh daftar periksa (*checklist*) dan blok *To-Do* dari semua catatan lengkap dengan indikator prioritas, tenggat waktu, dan persentase progres penyelesaian.
- **Galeri Templat Siap Pakai**: Buat catatan baru dalam satu klik dari templat *Notulen Rapat*, *Jurnal Refleksi Harian*, *Spesifikasi Produk (PRD)*, *Brainstorming Sticky*, atau *Peta Konsep Kanvas*.

### 3. Privasi & Penyimpanan Lokal Mandiri
- **Autosave Instan**: Seluruh perubahan disimpan otomatis di penyimpanan lokal peramban (`localStorage`).
- **Ekspor & Impor JSON**: Unduh cadangan seluruh ruang kerja dalam format `.json` dan pulihkan kapan saja di perangkat lain.
- **Unduh Markdown (`.md`)**: Ekspor dokumen aktif menjadi berkas Markdown standar.
- **Mode Terang & Gelap**: Dukungan penuh tema *Warm Paper* (Terang) dan *Deep Carbon Slate* (Gelap).

---

## Pintasan Papan Ketik (Keyboard Shortcuts)

| Pintasan | Fungsi |
| :--- | :--- |
| `Cmd + K` / `Ctrl + K` | Membuka atau menutup modal Pencarian Cepat lintas catatan |

---

## Teknologi yang Digunakan

- **Frontend Framework**: React 19 + TypeScript
- **Styling & Tema**: Tailwind CSS v4 (`@tailwindcss/vite`) dengan dukungan variabel tipografi editorial (`Plus Jakarta Sans`, `DM Sans`, `Source Serif 4`, dan `JetBrains Mono`)
- **Ikonografi**: Lucide React
- **Build Tool**: Vite

---

## Cara Menjalankan di Lingkungan Lokal

1. **Instal dependensi**:
   ```bash
   npm install
   ```
2. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```
3. **Bangun untuk produksi**:
   ```bash
   npm run build
   ```

---

## Peta Jalan & Saran Pengembangan Lanjutan (Roadmap)

1. **Tautan Dua Arah (*Bi-directional Wiki Links* `[[Judul Catatan]]`) & Peta Graf**:
   - Memungkinkan pengguna mengetik `[[Nama Catatan]]` di dalam editor untuk menghubungkan dua dokumen secara langsung dan menampilkan visualisasi graf jaringan pengetahuan (*Knowledge Graph*).
2. **Riwayat Versi (*Version History / Snapshots*)**:
   - Menyimpan titik pemulihan berkala di `IndexedDB` sehingga pengguna dapat melihat perbandingan perubahan (*diff*) dan mengembalikan catatan ke versi sebelumnya.
3. **Dukungan Lampiran Gambar & Rekaman Suara Lokal (`IndexedDB`)**:
   - Beralih dari `localStorage` ke `IndexedDB` agar mampu menyimpan lampiran gambar beresolusi tinggi, sketsa kanvas sebagai PNG, serta memo suara singkat.
4. **Sinkronisasi Cloud & Kolaborasi Waktu Nyata Opsional**:
   - Menambahkan opsi sinkronisasi ke Firebase Firestore atau Google Drive sehingga pengguna tetap bisa bekerja luring (*offline-first*), namun data otomatis tersinkronisasi antar-perangkat saat daring.
5. **Ekspor ke PDF & Gambar Kanvas (PNG/SVG)**:
   - Menyediakan fitur cetak/ekspor dokumen dengan tata letak tipografi buku serta unduhan langsung diagram Kanvas Visual menjadi gambar PNG/SVG siap presentasi.
6. **Pengingat & Tampilan Kalender Tugas**:
   - Menambahkan tampilan kalender bulanan/mingguan di **Pusat Tugas** berdasarkan tanggal tenggat (*due date*) pada setiap item *checklist*.
