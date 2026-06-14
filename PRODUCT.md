# Product

## Register

product

## Users

- **Murid**: siswa SMA Indonesia yang belajar untuk ulangan harian dan UTBK. Mereka membuka app di laptop atau HP, sering malam hari di kamar dengan lampu redup, dalam mode "drill cepat": buka deck, hafal, kuis, lihat skor. Bahasa sehari-hari, bukan bahasa formal.
- **Guru**: menyusun deck flashcard dan materi sekali, dipakai semua murid. Mereka butuh kepastian kontennya terlihat rapi di mata murid dan angka engagement (berapa murid yang mengerjakan kuis) yang jelas.
- **Admin (SUPERADMIN)**: mengelola persetujuan akun dan katalog konten kurasi.

Job to be done: mengubah materi sekolah jadi sesi belajar aktif (ringkasan, flashcard, kuis) dengan friksi sekecil mungkin.

## Product Purpose

BelajarDuluDek mengubah materi pelajaran menjadi flashcard, ringkasan AI, dan kuis interaktif. Sukses berarti murid kembali setiap hari (streak), menyelesaikan kuis, dan merasa skornya naik; guru merasa kontennya berdampak. Surface utama adalah dashboard ter-autentikasi; landing page hanya gerbang masuk.

## Brand Personality

Direct, friendly, motivating. Edukatif tapi modern; percaya diri tanpa terasa korporat. Copy memakai Bahasa Indonesia kasual khas anak SMA ("nggak", "biar", "mantap") tanpa jadi norak. Emosi target: momentum dan rasa mampu, bukan tekanan akademik. Dark-only adalah identitas, bukan opsi: app ini hidup di kamar belajar malam hari.

## Anti-references

- Dashboard SaaS generik: grid kartu identik, hero-metric template (angka besar + label kecil + gradient).
- "AI tool" berlebihan: gradient ungu-pink di teks, glow neon di mana-mana, sparkles di tiap sudut.
- Inter-on-white corporate layouts; app ini gelap dan berkarakter.
- Aplikasi edukasi kekanak-kanakan: maskot, warna pelangi, ilustrasi clip-art.

## Design Principles

1. **Belajar adalah panggung utama.** Konten kartu, soal, dan skor selalu elemen paling kontras di layar; chrome (sidebar, header, border) mundur.
2. **Feedback instan, perayaan yang diraih.** Setiap aksi belajar (jawab, flip, selesai kuis) memberi respons dalam satu frame; perayaan besar disimpan untuk momen hasil, bukan ditebar di tiap klik.
3. **Satu kosakata visual.** Liquid-glass untuk permukaan, primary untuk aksi dan identitas murid, sky untuk identitas guru, emerald/destructive untuk benar/salah. Tidak ada warna yang muncul tanpa arti.
4. **Hierarki lewat skala dan cahaya, bukan dekorasi.** Angka penting besar dan terang; metadata kecil dan redup. Tidak menambah ornamen untuk mengisi ruang.
5. **Motion menyampaikan status.** 150–250 ms ease-out untuk transisi UI; durasi lebih panjang hanya untuk momen fisik (flip kartu) dan reveal hasil.

## Accessibility & Inclusion

- `prefers-reduced-motion` sudah dihormati di level utilitas global; komponen baru tidak boleh melanggarnya.
- Semua kontrol interaktif punya `focus-visible` ring (`ring-ring`), label aria untuk aksi ikon, dan `aria-live` untuk feedback kuis.
- Kontras teks di atas permukaan gelap: body minimal `--muted-foreground` (#a0a0a0) di atas #121212; angka dan judul memakai `--foreground`.
- Status benar/salah tidak boleh hanya warna: selalu ada ikon (Check/X) atau teks pendamping.
