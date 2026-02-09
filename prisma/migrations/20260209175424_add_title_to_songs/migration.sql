/*
  Warnings:

  - Added the required column `title` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "title" TEXT NOT NULL;
