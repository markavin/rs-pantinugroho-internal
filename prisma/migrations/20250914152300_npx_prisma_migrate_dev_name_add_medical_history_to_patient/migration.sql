/*
  Warnings:

  - Added the required column `updatedAt` to the `patient_complaints` table without a default value. This is not possible if the table is not empty.
  - Made the column `birthDate` on table `patients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."lab_results" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."patient_complaints" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'BARU';

-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "medicalHistory" TEXT,
ALTER COLUMN "birthDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "lab_results_patientId_idx" ON "public"."lab_results"("patientId");

-- CreateIndex
CREATE INDEX "lab_results_testDate_idx" ON "public"."lab_results"("testDate");

-- CreateIndex
CREATE INDEX "patient_complaints_patientId_idx" ON "public"."patient_complaints"("patientId");

-- CreateIndex
CREATE INDEX "patient_complaints_date_idx" ON "public"."patient_complaints"("date");

-- CreateIndex
CREATE INDEX "patient_complaints_severity_idx" ON "public"."patient_complaints"("severity");

-- CreateIndex
CREATE INDEX "patient_complaints_status_idx" ON "public"."patient_complaints"("status");
