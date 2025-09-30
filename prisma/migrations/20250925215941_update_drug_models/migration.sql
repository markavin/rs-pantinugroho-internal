/*
  Warnings:

  - Added the required column `updatedAt` to the `drug_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."drug_data" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
