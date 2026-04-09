# Panduan Kalkulator Kripto V2

Folder ini berisi kalkulator untuk **Vigenere Cipher** dan **Caesar Cipher** dengan penjelasan langkah demi langkah (step-by-step).

## Fitur Utama
- **Enskripsi & Dekripsi:** Proses bolak-balik untuk mengamankan pesan.
- **Jalan Penyelesaian:** Tabel perhitungan matematis per karakter.
- **UI/UX Modern:** Menggunakan Tailwind CSS dangan gaya *Dark Glassmorphism* yang konsisten dengan proyek Kriptografi utama.
- **Edukasi:** Penjelasan maksud dari setiap rumus yang digunakan.

## Cara Penggunaan
1. Buka `index.html` di browser Anda.
2. Pilih tab **Vigenere** atau **Caesar**.
3. Masukkan teks yang ingin diproses.
4. Masukkan **Kunci** (untuk Vigenere: kata; untuk Caesar: angka).
5. Klik **Enskripsi** atau **Dekripsi**.
6. Lihat hasil di bagian kanan dan scroll ke bawah untuk melihat **Jalan Penyelesaian**.

## Pengertian Teknis

### 1. Vigenere Cipher
Menggunakan rumus:
- **Enskripsi:** $C_i = (P_i + K_i) \mod 26$
- **Dekripsi:** $P_i = (C_i - K_i + 26) \mod 26$

Dimana:
- $P$ = Plaintext (Pesan Asli)
- $K$ = Key (Kunci)
- $C$ = Ciphertext (Pesan Tersandi)

### 2. Caesar Cipher
Menggunakan rumus:
- **Enskripsi:** $E_n(x) = (x + n) \mod 26$
- **Dekripsi:** $D_n(x) = (x - n) \mod 26$

Dimana:
- $x$ = Posisi huruf asli
- $n$ = Besarnya pergeseran (shift)

## Deploy ke Vercel

Berkas yang sudah disiapkan:
- `vercel.json`: mengarahkan semua path ke `index.html` agar aman saat dibuka dari URL mana pun.
- `.vercelignore`: mengecualikan berkas yang tidak perlu ikut deploy.

Langkah cepat:
1. Push folder ini ke repository GitHub.
2. Import repository ke Vercel.
3. Framework preset: **Other** (atau biarkan auto-detect).
4. Build Command: kosongkan.
5. Output Directory: kosongkan.
