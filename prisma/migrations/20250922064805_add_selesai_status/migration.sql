/*
  Warnings:

  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "public"."PatientStatus" ADD VALUE 'SELESAI';

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "department";
