/*
  Warnings:

  - The values [PATIENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `timestamp` on the `alerts` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `visitations` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `visitations` table. All the data in the column will be lost.
  - You are about to drop the `blood_sugar_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `food_intakes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `food_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `food_recalls` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meal_entry_foods` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medical_records` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medication_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nutrition_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patient_complaints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patient_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pharmacy_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reminders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vital_signs` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `category` on the `alerts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `appointments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `technicianId` to the `lab_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `visitations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."StaffRecordType" AS ENUM ('CREDENTIALS', 'TRAINING', 'PERFORMANCE', 'SCHEDULE', 'NOTES');

-- CreateEnum
CREATE TYPE "public"."PatientRecordType" AS ENUM ('VITAL_SIGNS', 'COMPLAINTS', 'MEDICATION_LOG', 'DIET_LOG', 'EDUCATION', 'PROGRESS_NOTE');

-- CreateEnum
CREATE TYPE "public"."VisitationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."PharmacyRecordType" AS ENUM ('PRESCRIPTION', 'DISPENSING', 'COUNSELING', 'MONITORING', 'ADVERSE_EVENT');

-- CreateEnum
CREATE TYPE "public"."MedicalReportType" AS ENUM ('INITIAL_ASSESSMENT', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'CONSULTATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."AlertCategory" AS ENUM ('MEDICATION', 'BLOOD_SUGAR', 'VITAL_SIGNS', 'APPOINTMENT', 'LAB_RESULT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('INITIAL_VISIT', 'FOLLOW_UP', 'EMERGENCY', 'CONSULTATION', 'LAB_CHECK');

-- CreateEnum
CREATE TYPE "public"."AppointmentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
ALTER TYPE "public"."Shift" ADD VALUE 'MALAM';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('SUPER_ADMIN', 'DOKTER_SPESIALIS', 'PERAWAT_RUANGAN', 'PERAWAT_POLI', 'AHLI_GIZI', 'FARMASI', 'MANAJER', 'ADMINISTRASI');
ALTER TABLE "public"."users" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."blood_sugar_history" DROP CONSTRAINT "blood_sugar_history_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."education_notes" DROP CONSTRAINT "education_notes_educatorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."education_notes" DROP CONSTRAINT "education_notes_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."food_intakes" DROP CONSTRAINT "food_intakes_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."food_recalls" DROP CONSTRAINT "food_recalls_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."meal_entries" DROP CONSTRAINT "meal_entries_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."meal_entry_foods" DROP CONSTRAINT "meal_entry_foods_foodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."meal_entry_foods" DROP CONSTRAINT "meal_entry_foods_mealEntryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medical_records" DROP CONSTRAINT "medical_records_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medical_records" DROP CONSTRAINT "medical_records_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medication_logs" DROP CONSTRAINT "medication_logs_loggedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."medication_logs" DROP CONSTRAINT "medication_logs_medicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medication_logs" DROP CONSTRAINT "medication_logs_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medications" DROP CONSTRAINT "medications_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medications" DROP CONSTRAINT "medications_prescribedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."nutrition_plans" DROP CONSTRAINT "nutrition_plans_nutritionistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."nutrition_plans" DROP CONSTRAINT "nutrition_plans_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_complaints" DROP CONSTRAINT "patient_complaints_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."patient_logs" DROP CONSTRAINT "patient_logs_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."pharmacy_notes" DROP CONSTRAINT "pharmacy_notes_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vital_signs" DROP CONSTRAINT "vital_signs_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vital_signs" DROP CONSTRAINT "vital_signs_patientId_fkey";

-- AlterTable
ALTER TABLE "public"."alerts" DROP COLUMN "timestamp",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "public"."AlertPriority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "category",
ADD COLUMN     "category" "public"."AlertCategory" NOT NULL;

-- AlterTable
ALTER TABLE "public"."appointments" DROP COLUMN "doctorId",
ADD COLUMN     "priority" "public"."AppointmentPriority" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "type",
ADD COLUMN     "type" "public"."AppointmentType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."lab_results" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "technicianId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."visitations" DROP COLUMN "date",
DROP COLUMN "medications",
ADD COLUMN     "medicationsGiven" TEXT[],
ADD COLUMN     "nextVisitNeeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "public"."VisitationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "complaints" DROP NOT NULL,
ALTER COLUMN "labResults" DROP NOT NULL,
ALTER COLUMN "actions" DROP NOT NULL,
ALTER COLUMN "complications" DROP NOT NULL,
ALTER COLUMN "education" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."blood_sugar_history";

-- DropTable
DROP TABLE "public"."education_notes";

-- DropTable
DROP TABLE "public"."food_intakes";

-- DropTable
DROP TABLE "public"."food_items";

-- DropTable
DROP TABLE "public"."food_recalls";

-- DropTable
DROP TABLE "public"."meal_entries";

-- DropTable
DROP TABLE "public"."meal_entry_foods";

-- DropTable
DROP TABLE "public"."medical_records";

-- DropTable
DROP TABLE "public"."medication_logs";

-- DropTable
DROP TABLE "public"."medications";

-- DropTable
DROP TABLE "public"."nutrition_plans";

-- DropTable
DROP TABLE "public"."patient_complaints";

-- DropTable
DROP TABLE "public"."patient_logs";

-- DropTable
DROP TABLE "public"."pharmacy_notes";

-- DropTable
DROP TABLE "public"."reminders";

-- DropTable
DROP TABLE "public"."vital_signs";

-- DropEnum
DROP TYPE "public"."BloodSugarTrend";

-- DropEnum
DROP TYPE "public"."ComplaintSeverity";

-- DropEnum
DROP TYPE "public"."ComplaintStatus";

-- DropEnum
DROP TYPE "public"."EducationType";

-- DropEnum
DROP TYPE "public"."MealType";

-- DropEnum
DROP TYPE "public"."PharmacyNoteCategory";

-- CreateTable
CREATE TABLE "public"."staff_records" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "recordType" "public"."StaffRecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordType" "public"."PatientRecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "bloodSugar" DOUBLE PRECISION,
    "bloodPressure" TEXT,
    "temperature" DOUBLE PRECISION,
    "heartRate" INTEGER,
    "weight" DOUBLE PRECISION,
    "medicationCompliance" INTEGER,
    "dietCompliance" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutrition_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "foodRecall" JSONB NOT NULL,
    "dietaryPattern" TEXT,
    "foodAllergies" TEXT[],
    "targetCalories" INTEGER NOT NULL,
    "carbLimit" INTEGER,
    "proteinGoal" INTEGER,
    "fatLimit" INTEGER,
    "mealDistribution" JSONB,
    "dietPlan" TEXT,
    "complianceScore" INTEGER,
    "weightChange" DOUBLE PRECISION,
    "bmiChange" DOUBLE PRECISION,
    "nutritionGoals" TEXT[],
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pharmacy_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pharmacistId" TEXT NOT NULL,
    "recordType" "public"."PharmacyRecordType" NOT NULL,
    "medications" JSONB,
    "dosageInstructions" TEXT,
    "drugInteractions" TEXT[],
    "contraindications" TEXT[],
    "counselingNotes" TEXT,
    "adherenceScore" INTEGER,
    "sideEffects" TEXT[],
    "transactionTotal" DOUBLE PRECISION,
    "insuranceClaim" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_reports" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "reportType" "public"."MedicalReportType" NOT NULL,
    "chiefComplaint" TEXT,
    "historyOfIllness" TEXT,
    "physicalExamination" JSONB,
    "diagnosis" TEXT NOT NULL,
    "differentialDx" TEXT[],
    "treatmentPlan" TEXT,
    "medications" JSONB,
    "labOrders" TEXT[],
    "followUpPlan" TEXT,
    "referrals" TEXT[],
    "recommendations" TEXT[],
    "riskFactors" TEXT[],
    "complications" TEXT[],
    "prognosis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_records_staffId_idx" ON "public"."staff_records"("staffId");

-- CreateIndex
CREATE INDEX "staff_records_recordType_idx" ON "public"."staff_records"("recordType");

-- CreateIndex
CREATE INDEX "patient_records_patientId_idx" ON "public"."patient_records"("patientId");

-- CreateIndex
CREATE INDEX "patient_records_recordType_idx" ON "public"."patient_records"("recordType");

-- CreateIndex
CREATE INDEX "nutrition_records_patientId_idx" ON "public"."nutrition_records"("patientId");

-- CreateIndex
CREATE INDEX "nutrition_records_nutritionistId_idx" ON "public"."nutrition_records"("nutritionistId");

-- CreateIndex
CREATE INDEX "pharmacy_records_patientId_idx" ON "public"."pharmacy_records"("patientId");

-- CreateIndex
CREATE INDEX "pharmacy_records_pharmacistId_idx" ON "public"."pharmacy_records"("pharmacistId");

-- CreateIndex
CREATE INDEX "pharmacy_records_recordType_idx" ON "public"."pharmacy_records"("recordType");

-- CreateIndex
CREATE INDEX "medical_reports_patientId_idx" ON "public"."medical_reports"("patientId");

-- CreateIndex
CREATE INDEX "medical_reports_doctorId_idx" ON "public"."medical_reports"("doctorId");

-- CreateIndex
CREATE INDEX "medical_reports_reportType_idx" ON "public"."medical_reports"("reportType");

-- CreateIndex
CREATE INDEX "alerts_patientId_idx" ON "public"."alerts"("patientId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "public"."alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_priority_idx" ON "public"."alerts"("priority");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "public"."appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "public"."appointments"("appointmentDate");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "public"."appointments"("status");

-- CreateIndex
CREATE INDEX "lab_results_technicianId_idx" ON "public"."lab_results"("technicianId");

-- CreateIndex
CREATE INDEX "visitations_patientId_idx" ON "public"."visitations"("patientId");

-- CreateIndex
CREATE INDEX "visitations_nurseId_idx" ON "public"."visitations"("nurseId");

-- CreateIndex
CREATE INDEX "visitations_visitDate_idx" ON "public"."visitations"("visitDate");

-- AddForeignKey
ALTER TABLE "public"."staff_records" ADD CONSTRAINT "staff_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_records" ADD CONSTRAINT "patient_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_results" ADD CONSTRAINT "lab_results_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nutrition_records" ADD CONSTRAINT "nutrition_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nutrition_records" ADD CONSTRAINT "nutrition_records_nutritionistId_fkey" FOREIGN KEY ("nutritionistId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pharmacy_records" ADD CONSTRAINT "pharmacy_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pharmacy_records" ADD CONSTRAINT "pharmacy_records_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_reports" ADD CONSTRAINT "medical_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_reports" ADD CONSTRAINT "medical_reports_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
