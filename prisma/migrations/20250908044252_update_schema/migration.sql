/*
  Warnings:

  - The `status` column on the `lab_results` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BloodSugarHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DrugData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientComplaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientLog` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `category` on the `pharmacy_notes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."PatientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RUJUK_BALIK', 'MONITORING', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "public"."LabStatus" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."ComplaintSeverity" AS ENUM ('RINGAN', 'SEDANG', 'BERAT');

-- CreateEnum
CREATE TYPE "public"."ComplaintStatus" AS ENUM ('BARU', 'DALAM_PROSES', 'SELESAI');

-- CreateEnum
CREATE TYPE "public"."BloodSugarTrend" AS ENUM ('INCREASING', 'STABLE', 'DECREASING');

-- CreateEnum
CREATE TYPE "public"."Shift" AS ENUM ('PAGI', 'SORE');

-- DropForeignKey
ALTER TABLE "public"."BloodSugarHistory" DROP CONSTRAINT "BloodSugarHistory_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientComplaint" DROP CONSTRAINT "PatientComplaint_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientLog" DROP CONSTRAINT "PatientLog_patientId_fkey";

-- AlterTable
ALTER TABLE "public"."lab_results" DROP COLUMN "status",
ADD COLUMN     "status" "public"."LabStatus";

-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "calorieNeeds" INTEGER,
ADD COLUMN     "calorieRequirement" INTEGER,
ADD COLUMN     "dietCompliance" INTEGER,
ADD COLUMN     "dietPlan" TEXT,
ADD COLUMN     "lastVisit" TIMESTAMP(3),
ADD COLUMN     "nextAppointment" TIMESTAMP(3),
ADD COLUMN     "riskLevel" "public"."RiskLevel",
ADD COLUMN     "status" "public"."PatientStatus";

-- AlterTable
ALTER TABLE "public"."pharmacy_notes" DROP COLUMN "category",
ADD COLUMN     "category" "public"."PharmacyNoteCategory" NOT NULL;

-- DropTable
DROP TABLE "public"."BloodSugarHistory";

-- DropTable
DROP TABLE "public"."DrugData";

-- DropTable
DROP TABLE "public"."PatientComplaint";

-- DropTable
DROP TABLE "public"."PatientLog";

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "type" "public"."AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "glycemicIndex" INTEGER NOT NULL,
    "diabeticFriendly" BOOLEAN NOT NULL,
    "sodium" INTEGER NOT NULL,
    "sugar" DOUBLE PRECISION NOT NULL,
    "portion" TEXT NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meal_entries" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "totalCalories" INTEGER NOT NULL,
    "totalCarbs" DOUBLE PRECISION NOT NULL,
    "totalProtein" DOUBLE PRECISION NOT NULL,
    "totalFat" DOUBLE PRECISION NOT NULL,
    "bloodSugarBefore" INTEGER,
    "bloodSugarAfter" INTEGER,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meal_entry_foods" (
    "id" TEXT NOT NULL,
    "mealEntryId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "portion" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "meal_entry_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_recalls" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "totalCalories" INTEGER NOT NULL,
    "totalCarbs" DOUBLE PRECISION NOT NULL,
    "totalProtein" DOUBLE PRECISION NOT NULL,
    "totalFat" DOUBLE PRECISION NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_recalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drug_data" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "interactions" TEXT[],
    "contraindications" TEXT[],
    "sideEffects" TEXT[],
    "indications" TEXT[],

    CONSTRAINT "drug_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_complaints" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "complaint" TEXT NOT NULL,
    "severity" "public"."ComplaintSeverity" NOT NULL,
    "status" "public"."ComplaintStatus" NOT NULL,

    CONSTRAINT "patient_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blood_sugar_history" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "trend" "public"."BloodSugarTrend",
    "notes" TEXT,

    CONSTRAINT "blood_sugar_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patient_logs" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "comorbidities" TEXT[],
    "allergies" TEXT[],
    "currentMedications" TEXT[],

    CONSTRAINT "patient_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."visitations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" "public"."Shift" NOT NULL,
    "complaints" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "labResults" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "complications" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "vitalSigns" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_entries" ADD CONSTRAINT "meal_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_entry_foods" ADD CONSTRAINT "meal_entry_foods_mealEntryId_fkey" FOREIGN KEY ("mealEntryId") REFERENCES "public"."meal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_entry_foods" ADD CONSTRAINT "meal_entry_foods_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "public"."food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_recalls" ADD CONSTRAINT "food_recalls_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_complaints" ADD CONSTRAINT "patient_complaints_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blood_sugar_history" ADD CONSTRAINT "blood_sugar_history_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_logs" ADD CONSTRAINT "patient_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitations" ADD CONSTRAINT "visitations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitations" ADD CONSTRAINT "visitations_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
