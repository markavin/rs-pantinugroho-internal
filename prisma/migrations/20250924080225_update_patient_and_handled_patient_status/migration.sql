/*
  Warnings:

  - The values [ACTIVE,COMPLETED,TRANSFERRED,DISCONTINUED,ON_HOLD] on the enum `HandledPatientStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."HandledPatientStatus_new" AS ENUM ('SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'STABIL', 'EMERGENCY', 'RUJUK_KELUAR', 'SELESAI');
ALTER TABLE "public"."handled_patients" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."handled_patients" ALTER COLUMN "status" TYPE "public"."HandledPatientStatus_new" USING ("status"::text::"public"."HandledPatientStatus_new");
ALTER TYPE "public"."HandledPatientStatus" RENAME TO "HandledPatientStatus_old";
ALTER TYPE "public"."HandledPatientStatus_new" RENAME TO "HandledPatientStatus";
DROP TYPE "public"."HandledPatientStatus_old";
ALTER TABLE "public"."handled_patients" ALTER COLUMN "status" SET DEFAULT 'SEDANG_DITANGANI';
COMMIT;

-- AlterTable
ALTER TABLE "public"."handled_patients" ALTER COLUMN "status" SET DEFAULT 'SEDANG_DITANGANI';
