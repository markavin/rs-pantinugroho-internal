/*
  Warnings:

  - The values [AKTIF] on the enum `PatientStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `handled_patients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId,handledBy]` on the table `handled_patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PatientStatus_new" AS ENUM ('ANTRIAN', 'SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'RAWAT_JALAN', 'RAWAT_INAP', 'RUJUK_KELUAR', 'PULANG', 'PULANG_PAKSA', 'MENINGGAL');
ALTER TABLE "public"."patients" ALTER COLUMN "status" TYPE "public"."PatientStatus_new" USING ("status"::text::"public"."PatientStatus_new");
ALTER TYPE "public"."PatientStatus" RENAME TO "PatientStatus_old";
ALTER TYPE "public"."PatientStatus_new" RENAME TO "PatientStatus";
DROP TYPE "public"."PatientStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."handled_patients_patientId_handledBy_status_key";

-- DropIndex
DROP INDEX "public"."handled_patients_status_idx";

-- AlterTable
ALTER TABLE "public"."handled_patients" DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."HandledPatientStatus";

-- CreateIndex
CREATE UNIQUE INDEX "handled_patients_patientId_handledBy_key" ON "public"."handled_patients"("patientId", "handledBy");
