# Panduan Kalkulator Kripto Lite Plus

Folder ini berisi kalkulator Kriptografi yang diperluas, mencakup algoritma Klasik, Matriks, dan Modern.

## Fitur Utama
- **Algoritma Baru:** Ditambahkan Affine, Hill (2x2), Playfair, dan RSA.
- **Enskripsi & Dekripsi:** Proses bolak-balik untuk mengamankan pesan.
- **Jalan Penyelesaian:** Penjelasan langkah demi langkah disertakan untuk setiap algoritma.
- **UI/UX Modern Enhanced:** Menggunakan Tailwind CSS dangan gaya *Dark Glassmorphism* dengan navigasi tab yang responsif.

## Daftar Algoritma
1. **Vigenere Cipher:** Substitusi polialfabetik.
2. **Caesar Cipher:** Pergeseran alfabet (Shift).
3. **Affine Cipher:** Rumus $ax + b \pmod{26}$ (Kunci: a & b).
4. **Hill Cipher:** Enkripsi blok menggunakan matriks $2 \times 2$ mod 26.
5. **Playfair Cipher:** Substitusi pasangan huruf (Bigram) menggunakan matriks $5 \times 5$.
6. **RSA:** Algoritma asimetris (Kunci Publik/Privat).

## Cara Penggunaan
1. Buka `index.html` di browser Anda.
2. Pilih tab algoritma yang diinginkan.
3. Masukkan teks dan kunci yang sesuai (Input kunci akan berubah otomatis).
4. Klik **Enskripsi** atau **Dekripsi**.
5. Lihat hasil di bagian kanan dan scroll ke bawah untuk melihat **Jalan Penyelesaian**.

## Pengertian Teknis Utama

### RSA (Modern)
- **Enkripsi:** $C = M^e \pmod n$
- **Dekripsi:** $M = C^d \pmod n$
- Memerlukan parameter $e$, $n$ (untuk enkripsi) dan $d$, $n$ (untuk dekripsi).

## Deploy ke Vercel
... (sama seperti versi sebelumnya) ...
