-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FICTION', 'NON_FICTION', 'SCIENCE', 'FANTASY', 'DETECTIVE', 'ROMANCE', 'HORROR', 'BIOGRAPHY', 'HISTORY');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "category" "Category";

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "LibraryBook" (
    "bookId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LibraryBook_pkey" PRIMARY KEY ("bookId","libraryId")
);

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryBook" ADD CONSTRAINT "LibraryBook_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;
