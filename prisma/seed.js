// Seed idempoten — dijalankan otomatis oleh docker-entrypoint.sh dan bisa
// dipanggil manual: `node prisma/seed.js` (butuh DATABASE_URL).
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser({ email, name, password, role, status }) {
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    // Jangan menimpa kata sandi yang mungkin sudah diganti pengguna.
    update: { role, status },
    create: { email, name, password: hashed, role, status },
  });
}

async function main() {
  // Akun SUPERADMIN pertama — tanpa ini tidak ada yang bisa menyetujui
  // pendaftar baru di instance yang masih kosong.
  await upsertUser({
    email: process.env.SEED_ADMIN_EMAIL || "admin@belajarduludek.id",
    name: "Admin BelajarDuluDek",
    password: process.env.SEED_ADMIN_PASSWORD || "admin12345",
    role: "SUPERADMIN",
    status: "APPROVED",
  });

  // Akun murid uji coba (perilaku seed lama dipertahankan).
  await upsertUser({
    email: "e2e@test.local",
    name: "E2E Test",
    password: "oldpassword",
    role: "MURID",
    status: "APPROVED",
  });

  console.log("Seed selesai: akun admin & akun uji siap dipakai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
