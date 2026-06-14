#!/bin/sh
set -e

echo "==> Menjalankan migrasi database (prisma migrate deploy)..."
npx prisma migrate deploy

echo "==> Menyiapkan akun awal (idempoten)..."
node prisma/seed.js

echo "==> Menyalakan server..."
exec npm start
