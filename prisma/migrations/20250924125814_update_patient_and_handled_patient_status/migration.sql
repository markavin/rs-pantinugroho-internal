/*
  Warnings:

  - The values [ANTRIAN,SEDANG_DITANGANI,KONSULTASI,OBSERVASI,EMERGENCY] on the enum `PatientStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."HandledPatientStatus" AS ENUM ('ANTRIAN', 'SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'STABIL', 'RUJUK_KELUAR', 'SELESAI', 'MENINGGAL');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PatientStatus_new" AS ENUM ('AKTIF', 'RAWAT_JALAN', 'RAWAT_INAP', 'RUJUK_KELUAR', 'PULANG', 'PULANG_PAKSA', 'MENINGGAL');
ALTER TABLE "public"."patients" ALTER COLUMN "status" TYPE "public"."PatientStatus_new" USING ("status"::text::"public"."PatientStatus_new");
ALTER TYPE "public"."PatientStatus" RENAME TO "PatientStatus_old";
ALTER TYPE "public"."PatientStatus_new" RENAME TO "PatientStatus";
DROP TYPE "public"."PatientStatus_old";
COMMIT;
