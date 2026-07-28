# Panel Jadwal Pertandingan

Panel otomatis untuk mengambil jadwal pertandingan (tanpa odds) dari [API-Football](https://www.api-football.com/), lalu memformatnya jadi teks rapi terkelompok per liga — siap dipakai untuk update jadwal harian.

## Cara Setup Lokal

1. Install dependencies:
   ```bash
   npm install
   ```

2. Buat file `.env.local` (copy dari `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

3. Isi `API_FOOTBALL_KEY` di `.env.local` dengan API key kamu (dari [api-sports.io](https://www.api-football.com/) atau RapidAPI).

4. Jalankan development server:
   ```bash
   npm run dev
   ```

5. Buka `http://localhost:3000`, pilih rentang tanggal, klik "Ambil Jadwal".

## Cara Deploy ke Vercel

1. Push project ini ke repo GitHub kamu.
2. Buka [vercel.com](https://vercel.com), pilih "Add New Project", import repo GitHub tadi.
3. Saat konfigurasi, tambahkan Environment Variable:
   - Key: `API_FOOTBALL_KEY`
   - Value: API key kamu
   - Scope: Production, Preview, Development (centang semua)
4. Klik Deploy.
5. Setelah selesai, panel bisa diakses lewat URL `*.vercel.app` yang diberikan Vercel.

## Catatan Penting

- **Rate limit**: paket gratis API-Football membatasi 100 request/hari. Setiap kali kamu klik "Ambil Jadwal" untuk rentang N hari, itu memakai N request (satu request per tanggal). Jangan generate berkali-kali dalam waktu singkat untuk rentang tanggal yang sama — pertimbangkan menyimpan hasilnya (misalnya di database atau file) kalau butuh dibuka berulang.
- **Timezone**: API dipanggil dengan parameter `timezone=Asia/Jakarta`, jadi semua jam yang tampil sudah otomatis WIB — tidak perlu konversi manual.
- **Validitas data**: karena datanya langsung dari API-Football (yang bersumber dari liga/federasi resmi), status pertandingan (ditunda/dibatalkan) juga ikut terbawa di data mentah (`raw`) kalau suatu saat kamu mau menampilkannya.
- Panel ini hanya menyediakan **jadwal**, tidak ada data odds/handicap maupun prediksi skor.

## Struktur Project

```
app/
  api/fixtures/route.js   # Endpoint backend: fetch + format data dari API-Football
  page.js                 # UI: input tanggal, tombol generate, hasil teks
  layout.js                # Root layout Next.js
```
