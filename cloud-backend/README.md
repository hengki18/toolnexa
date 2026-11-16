# Aktivasi AI Cloud ToolNexa (uji pribadi)
1. Buat API key di https://aistudio.google.com/apikey pada proyek free tier tanpa mengaktifkan billing. Jangan kirim key lewat chat atau simpan di repo.
2. Buka https://dash.cloudflare.com/ dan buat Worker pada Workers & Pages. Gunakan isi worker.js sebagai kode Worker.
3. Settings > Variables and Secrets: tambahkan Secret GEMINI_API_KEY dan ACCESS_CODE (kode acak minimal 24 karakter, berbeda dari API key). Deploy. Jangan gunakan kode akses bersama publik. Jika memakai Wrangler, wrangler.jsonc menyediakan binding rate limit tambahan.
4. Salin URL HTTPS Worker. Isi hanya URL publik tersebut pada microstock-metadata/cloud-config.js, lalu perbarui versi cache config pada index.html bila perlu.
5. Uji dengan aset non-rahasia. Pilih AI Cloud, masukkan kode akses uji dan centang persetujuan. Foto dikirim sebagai JPEG 768 px; video hanya tiga bingkai. Kuota gratis terbatas, dapat berubah, dan Google dapat memakai data untuk peningkatan produk. Tidak ada jaminan latensi. Sebelum membuka akses publik, tambahkan autentikasi/Turnstile, pembatasan kuota global dan tinjau kebijakan privasi.
