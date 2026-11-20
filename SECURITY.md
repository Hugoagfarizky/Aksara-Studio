# Kebijakan Keamanan

Repo ini berisi ruang kerja catatan digital multi-mode (Aksara Studio). Catatan disimpan di perangkat lewat penyimpanan lokal. Ada integrasi Gemini API opsional, jadi kuncinya harus di `.env`.

## Melaporkan celah

- **Jangan** membuka issue publik untuk masalah keamanan.
- Kirim email ke **nugrahaagfarizky@gmail.com** dengan subjek `[SECURITY] Aksara-Studio`.
- Sertakan langkah reproduksi, dampak, dan saran perbaikan kalau ada.

Balasan diusahakan dalam **7 hari**.

## Cakupan

| Termasuk | Tidak termasuk |
| --- | --- |
| Kode di repo ini | Layanan pihak ketiga: Google Gemini API (opsional) |

## Kunci rahasia

Simpan kunci Gemini di `.env` (lihat `.env.example`). Jangan pernah commit nilainya.

## Versi yang didukung

Hanya branch `main`.