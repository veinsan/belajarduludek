-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN "imageUrl" TEXT;
