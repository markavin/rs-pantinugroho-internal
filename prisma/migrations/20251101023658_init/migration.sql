-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'DOKTER_SPESIALIS', 'PERAWAT_RUANGAN', 'PERAWAT_POLI', 'AHLI_GIZI', 'FARMASI', 'MANAJER', 'ADMINISTRASI');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."InsuranceType" AS ENUM ('PRIVATE', 'BPJS', 'CORPORATE');

-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."PatientStatus" AS ENUM ('AKTIF', 'RAWAT_JALAN', 'RAWAT_INAP', 'RUJUK_KELUAR', 'PULANG', 'PULANG_PAKSA', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "public"."HandledPatientStatus" AS ENUM ('ANTRIAN', 'SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'STABIL', 'RUJUK_KELUAR', 'SELESAI', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "public"."HandledPatientPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."StaffRecordType" AS ENUM ('CREDENTIALS', 'TRAINING', 'PERFORMANCE', 'SCHEDULE', 'NOTES');

-- CreateEnum
CREATE TYPE "public"."PatientRecordType" AS ENUM ('VITAL_SIGNS', 'COMPLAINTS', 'MEDICATION_LOG', 'DIET_LOG', 'EDUCATION', 'PROGRESS_NOTE');

-- CreateEnum
CREATE TYPE "public"."LabStatus" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."Shift" AS ENUM ('PAGI', 'SORE', 'MALAM');

-- CreateEnum
CREATE TYPE "public"."VisitationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."PharmacyRecordType" AS ENUM ('PRESCRIPTION', 'DISPENSING', 'COUNSELING', 'MONITORING', 'ADVERSE_EVENT');

-- CreateEnum
CREATE TYPE "public"."MedicalReportType" AS ENUM ('INITIAL_ASSESSMENT', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'CONSULTATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "public"."AlertCategory" AS ENUM ('SYSTEM', 'BLOOD_SUGAR', 'VITAL_SIGNS', 'LAB_RESULT', 'MEDICATION', 'NUTRITION', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "public"."AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."SmokingStatus" AS ENUM ('TIDAK_MEROKOK', 'PEROKOK', 'MANTAN_PEROKOK');

-- CreateTable
CREATE TABLE "public"."login_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutTime" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "employeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" TEXT NOT NULL,
    "mrNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bloodType" TEXT,
    "allergies" TEXT[],
    "medicalHistory" TEXT,
    "latestEnergyRequirement" INTEGER,
    "latestBMI" DOUBLE PRECISION,
    "lastWeightUpdate" TIMESTAMP(3),
    "lastHeightUpdate" TIMESTAMP(3),
    "lastEnergyCalculation" JSONB,
    "searBRiskPercentage" DOUBLE PRECISION,
    "searBRiskLevel" TEXT,
    "searBLastCalculated" TIMESTAMP(3),
    "diabetesType" TEXT,
    "diagnosisDate" TIMESTAMP(3),
    "comorbidities" TEXT[],
    "smokingStatus" "public"."SmokingStatus",
    "insuranceType" "public"."InsuranceType" NOT NULL,
    "insuranceNumber" TEXT,
    "lastVisit" TIMESTAMP(3),
    "nextAppointment" TIMESTAMP(3),
    "riskLevel" "public"."RiskLevel",
    "status" "public"."PatientStatus",
    "dietCompliance" INTEGER,
    "calorieNeeds" INTEGER,
    "calorieRequirement" INTEGER,
    "dietPlan" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."handled_patients" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "handledBy" TEXT NOT NULL,
    "handledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "notes" TEXT,
    "status" "public"."HandledPatientStatus" NOT NULL DEFAULT 'SEDANG_DITANGANI',
    "priority" "public"."HandledPatientPriority" NOT NULL DEFAULT 'NORMAL',
    "nextVisitDate" TIMESTAMP(3),
    "estimatedDuration" TEXT,
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handled_patients_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."lab_results" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "testType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalRange" TEXT,
    "status" "public"."LabStatus",
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."visitations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" "public"."Shift" NOT NULL,
    "temperature" DOUBLE PRECISION,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,
    "bloodSugar" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" INTEGER,
    "complaints" TEXT,
    "medicationsGiven" TEXT[],
    "labResults" TEXT,
    "actions" TEXT,
    "complications" TEXT,
    "education" TEXT,
    "notes" TEXT,
    "dietCompliance" INTEGER,
    "dietIssues" TEXT,
    "energyRequirement" INTEGER,
    "calculatedBMI" DOUBLE PRECISION,
    "calculatedBBI" DOUBLE PRECISION,
    "basalMetabolicRate" INTEGER,
    "activityLevel" TEXT,
    "stressLevel" TEXT,
    "stressFactor" DOUBLE PRECISION,
    "nutritionStatus" TEXT,
    "energyCalculationDetail" JSONB,
    "nextVisitNeeded" BOOLEAN NOT NULL DEFAULT false,
    "priority" "public"."VisitationPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitations_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "public"."drug_data" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "categoryKehamilan" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "interactions" TEXT[],
    "contraindications" TEXT[],
    "sideEffects" TEXT[],
    "indications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drug_transactions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "drug_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drug_transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "drug_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "type" "public"."AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "patientId" TEXT,
    "category" "public"."AlertCategory" NOT NULL,
    "priority" "public"."AlertPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "targetRole" "public"."UserRole",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_logs_sessionId_key" ON "public"."login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_userId_idx" ON "public"."login_logs"("userId");

-- CreateIndex
CREATE INDEX "login_logs_sessionId_idx" ON "public"."login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_loginTime_idx" ON "public"."login_logs"("loginTime");

-- CreateIndex
CREATE INDEX "login_logs_logoutTime_idx" ON "public"."login_logs"("logoutTime");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "public"."users"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrNumber_key" ON "public"."patients"("mrNumber");

-- CreateIndex
CREATE INDEX "handled_patients_handledBy_idx" ON "public"."handled_patients"("handledBy");

-- CreateIndex
CREATE INDEX "handled_patients_patientId_idx" ON "public"."handled_patients"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "handled_patients_patientId_handledBy_key" ON "public"."handled_patients"("patientId", "handledBy");

-- CreateIndex
CREATE INDEX "staff_records_staffId_idx" ON "public"."staff_records"("staffId");

-- CreateIndex
CREATE INDEX "staff_records_recordType_idx" ON "public"."staff_records"("recordType");

-- CreateIndex
CREATE INDEX "patient_records_patientId_idx" ON "public"."patient_records"("patientId");

-- CreateIndex
CREATE INDEX "patient_records_recordType_idx" ON "public"."patient_records"("recordType");

-- CreateIndex
CREATE INDEX "lab_results_patientId_idx" ON "public"."lab_results"("patientId");

-- CreateIndex
CREATE INDEX "lab_results_testDate_idx" ON "public"."lab_results"("testDate");

-- CreateIndex
CREATE INDEX "lab_results_technicianId_idx" ON "public"."lab_results"("technicianId");

-- CreateIndex
CREATE INDEX "visitations_patientId_idx" ON "public"."visitations"("patientId");

-- CreateIndex
CREATE INDEX "visitations_nurseId_idx" ON "public"."visitations"("nurseId");

-- CreateIndex
CREATE INDEX "visitations_visitDate_idx" ON "public"."visitations"("visitDate");

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
CREATE INDEX "drug_transactions_patientId_idx" ON "public"."drug_transactions"("patientId");

-- CreateIndex
CREATE INDEX "drug_transactions_status_idx" ON "public"."drug_transactions"("status");

-- CreateIndex
CREATE INDEX "drug_transactions_createdAt_idx" ON "public"."drug_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "drug_transaction_items_transactionId_idx" ON "public"."drug_transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "drug_transaction_items_drugId_idx" ON "public"."drug_transaction_items"("drugId");

-- CreateIndex
CREATE INDEX "alerts_patientId_idx" ON "public"."alerts"("patientId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "public"."alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_priority_idx" ON "public"."alerts"("priority");

-- CreateIndex
CREATE INDEX "alerts_targetRole_idx" ON "public"."alerts"("targetRole");

-- AddForeignKey
ALTER TABLE "public"."login_logs" ADD CONSTRAINT "login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handled_patients" ADD CONSTRAINT "handled_patients_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handled_patients" ADD CONSTRAINT "handled_patients_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."staff_records" ADD CONSTRAINT "staff_records_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."patient_records" ADD CONSTRAINT "patient_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_results" ADD CONSTRAINT "lab_results_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_results" ADD CONSTRAINT "lab_results_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitations" ADD CONSTRAINT "visitations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."visitations" ADD CONSTRAINT "visitations_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "public"."drug_transactions" ADD CONSTRAINT "drug_transactions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drug_transaction_items" ADD CONSTRAINT "drug_transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."drug_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drug_transaction_items" ADD CONSTRAINT "drug_transaction_items_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "public"."drug_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
