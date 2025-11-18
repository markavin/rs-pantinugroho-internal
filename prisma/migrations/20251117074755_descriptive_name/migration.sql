-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DOKTER_SPESIALIS', 'PERAWAT_RUANGAN', 'PERAWAT_POLI', 'AHLI_GIZI', 'FARMASI', 'LABORATORIUM', 'MANAJER', 'ADMINISTRASI');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('PRIVATE', 'BPJS', 'CORPORATE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('AKTIF', 'RAWAT_JALAN', 'RAWAT_INAP', 'RUJUK_KELUAR', 'PULANG', 'PULANG_PAKSA', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "HandledPatientStatus" AS ENUM ('ANTRIAN', 'SEDANG_DITANGANI', 'KONSULTASI', 'OBSERVASI', 'EMERGENCY', 'STABIL', 'RUJUK_KELUAR', 'SELESAI', 'MENINGGAL');

-- CreateEnum
CREATE TYPE "HandledPatientPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "StaffRecordType" AS ENUM ('CREDENTIALS', 'TRAINING', 'PERFORMANCE', 'SCHEDULE', 'NOTES');

-- CreateEnum
CREATE TYPE "PatientRecordType" AS ENUM ('VITAL_SIGNS', 'COMPLAINTS', 'MEDICATION_LOG', 'DIET_LOG', 'EDUCATION', 'PROGRESS_NOTE');

-- CreateEnum
CREATE TYPE "LabStatus" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('PAGI', 'SORE', 'MALAM');

-- CreateEnum
CREATE TYPE "VisitationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "PharmacyRecordType" AS ENUM ('PRESCRIPTION', 'DISPENSING', 'COUNSELING', 'MONITORING', 'ADVERSE_EVENT');

-- CreateEnum
CREATE TYPE "MedicalReportType" AS ENUM ('INITIAL_ASSESSMENT', 'PROGRESS_NOTE', 'DISCHARGE_SUMMARY', 'CONSULTATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "AlertCategory" AS ENUM ('SYSTEM', 'BLOOD_SUGAR', 'VITAL_SIGNS', 'LAB_RESULT', 'MEDICATION', 'NUTRITION', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SmokingStatus" AS ENUM ('TIDAK_MEROKOK', 'PEROKOK', 'MANTAN_PEROKOK');

-- CreateTable
CREATE TABLE "login_logs" (
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
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "employeeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "mrNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "idNumber" TEXT,
    "nationality" TEXT,
    "bloodType" TEXT,
    "language" TEXT,
    "motherName" TEXT,
    "intendedDoctor" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
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
    "smokingStatus" "SmokingStatus",
    "insuranceType" "InsuranceType" NOT NULL,
    "insuranceNumber" TEXT,
    "lastVisit" TIMESTAMP(3),
    "nextAppointment" TIMESTAMP(3),
    "riskLevel" "RiskLevel",
    "status" "PatientStatus",
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
CREATE TABLE "handled_patients" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "handledBy" TEXT NOT NULL,
    "handledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "notes" TEXT,
    "status" "HandledPatientStatus" NOT NULL DEFAULT 'SEDANG_DITANGANI',
    "priority" "HandledPatientPriority" NOT NULL DEFAULT 'NORMAL',
    "nextVisitDate" TIMESTAMP(3),
    "estimatedDuration" TEXT,
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handled_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_records" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "recordType" "StaffRecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "recordType" "PatientRecordType" NOT NULL,
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
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "testType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalRange" TEXT,
    "status" "LabStatus",
    "notes" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nurseId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" "Shift" NOT NULL,
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
    "priority" "VisitationPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_records" (
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
CREATE TABLE "pharmacy_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "pharmacistId" TEXT NOT NULL,
    "recordType" "PharmacyRecordType" NOT NULL,
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
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "reportType" "MedicalReportType" NOT NULL,
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
CREATE TABLE "drug_data" (
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
CREATE TABLE "drug_transactions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "drug_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "drug_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "patientId" TEXT,
    "category" "AlertCategory" NOT NULL,
    "priority" "AlertPriority" NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "targetRole" "UserRole",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_logs_sessionId_key" ON "login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_userId_idx" ON "login_logs"("userId");

-- CreateIndex
CREATE INDEX "login_logs_sessionId_idx" ON "login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_loginTime_idx" ON "login_logs"("loginTime");

-- CreateIndex
CREATE INDEX "login_logs_logoutTime_idx" ON "login_logs"("logoutTime");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrNumber_key" ON "patients"("mrNumber");

-- CreateIndex
CREATE INDEX "handled_patients_handledBy_idx" ON "handled_patients"("handledBy");

-- CreateIndex
CREATE INDEX "handled_patients_patientId_idx" ON "handled_patients"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "handled_patients_patientId_handledBy_key" ON "handled_patients"("patientId", "handledBy");

-- CreateIndex
CREATE INDEX "staff_records_staffId_idx" ON "staff_records"("staffId");

-- CreateIndex
CREATE INDEX "staff_records_recordType_idx" ON "staff_records"("recordType");

-- CreateIndex
CREATE INDEX "patient_records_patientId_idx" ON "patient_records"("patientId");

-- CreateIndex
CREATE INDEX "patient_records_recordType_idx" ON "patient_records"("recordType");

-- CreateIndex
CREATE INDEX "lab_results_patientId_idx" ON "lab_results"("patientId");

-- CreateIndex
CREATE INDEX "lab_results_testDate_idx" ON "lab_results"("testDate");

-- CreateIndex
CREATE INDEX "lab_results_technicianId_idx" ON "lab_results"("technicianId");

-- CreateIndex
CREATE INDEX "visitations_patientId_idx" ON "visitations"("patientId");

-- CreateIndex
CREATE INDEX "visitations_nurseId_idx" ON "visitations"("nurseId");

-- CreateIndex
CREATE INDEX "visitations_visitDate_idx" ON "visitations"("visitDate");

-- CreateIndex
CREATE INDEX "nutrition_records_patientId_idx" ON "nutrition_records"("patientId");

-- CreateIndex
CREATE INDEX "nutrition_records_nutritionistId_idx" ON "nutrition_records"("nutritionistId");

-- CreateIndex
CREATE INDEX "pharmacy_records_patientId_idx" ON "pharmacy_records"("patientId");

-- CreateIndex
CREATE INDEX "pharmacy_records_pharmacistId_idx" ON "pharmacy_records"("pharmacistId");

-- CreateIndex
CREATE INDEX "pharmacy_records_recordType_idx" ON "pharmacy_records"("recordType");

-- CreateIndex
CREATE INDEX "medical_reports_patientId_idx" ON "medical_reports"("patientId");

-- CreateIndex
CREATE INDEX "medical_reports_doctorId_idx" ON "medical_reports"("doctorId");

-- CreateIndex
CREATE INDEX "medical_reports_reportType_idx" ON "medical_reports"("reportType");

-- CreateIndex
CREATE INDEX "drug_transactions_patientId_idx" ON "drug_transactions"("patientId");

-- CreateIndex
CREATE INDEX "drug_transactions_status_idx" ON "drug_transactions"("status");

-- CreateIndex
CREATE INDEX "drug_transactions_createdAt_idx" ON "drug_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "drug_transaction_items_transactionId_idx" ON "drug_transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "drug_transaction_items_drugId_idx" ON "drug_transaction_items"("drugId");

-- CreateIndex
CREATE INDEX "alerts_patientId_idx" ON "alerts"("patientId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_priority_idx" ON "alerts"("priority");

-- CreateIndex
CREATE INDEX "alerts_targetRole_idx" ON "alerts"("targetRole");
