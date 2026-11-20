# Panduan Kontribusi

Aksara Studio menyatukan empat mode pencatatan: editor Markdown, dokumen blok ala wiki, papan sticky notes, dan kanvas visual bebas. React 19, Vite, dan Tailwind CSS.

## Menjalankan

```bash
npm install
npm run dev    # http://localhost:3000
npm run lint
```

## Sebelum mengirim perubahan

- `npm run lint` harus bersih (TypeScript tanpa error).
- Pastikan catatan tetap tersimpan lokal dan tidak hilang saat refresh.
- Jangan commit `.env`, kunci API, atau hasil build.

## Alur kontribusi

1. `git checkout -b fix/nama-singkat`
2. Commit dengan pesan yang jelas.
3. Buka pull request ke `main`, jelaskan **apa** dan **kenapa**.

Untuk masalah keamanan, ikuti `SECURITY.md`, jangan buka issue publik.

## Lisensi

Dengan mengirim pull request, kontribusimu dirilis di bawah [MIT License](LICENSE).