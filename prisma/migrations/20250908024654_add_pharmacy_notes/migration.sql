-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'DOKTER_SPESIALIS', 'PERAWAT_RUANGAN', 'PERAWAT_POLI', 'AHLI_GIZI', 'FARMASI', 'PATIENT');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."InsuranceType" AS ENUM ('PRIVATE', 'BPJS', 'CORPORATE');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."EducationType" AS ENUM ('DIET', 'MEDICATION', 'EXERCISE', 'COMPLICATIONS', 'GENERAL');

-- CreateEnum
CREATE TYPE "public"."MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "public"."PharmacyNoteCategory" AS ENUM ('MEDICATION', 'COUNSELING', 'MONITORING', 'ADVERSE_REACTION');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."patients" (
    "id" TEXT NOT NULL,
    "mrNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" "public"."Gender" NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bloodType" TEXT,
    "allergies" TEXT[],
    "diabetesType" TEXT,
    "diagnosisDate" TIMESTAMP(3),
    "comorbidities" TEXT[],
    "insuranceType" "public"."InsuranceType" NOT NULL,
    "insuranceNumber" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiefComplaint" TEXT NOT NULL,
    "historyOfIllness" TEXT,
    "physicalExamination" TEXT,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vital_signs" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicalRecordId" TEXT,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolicBP" INTEGER,
    "diastolicBP" INTEGER,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" DOUBLE PRECISION,
    "bloodGlucose" DOUBLE PRECISION,
    "bloodSugar" DOUBLE PRECISION,
    "hba1c" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lab_results" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "testType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalRange" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medications" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescribedBy" TEXT NOT NULL,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "genericName" TEXT,
    "instructions" TEXT,
    "interactions" TEXT[],
    "adherence" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medication_logs" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "loggedBy" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosageTaken" TEXT,
    "notes" TEXT,
    "wasSkipped" BOOLEAN NOT NULL DEFAULT false,
    "skipReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nutrition_plans" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "carbLimit" INTEGER NOT NULL,
    "proteinGoal" INTEGER NOT NULL,
    "fatLimit" INTEGER NOT NULL,
    "mealDistribution" JSONB NOT NULL,
    "restrictions" TEXT[],
    "goals" TEXT[],
    "compliance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."food_intakes" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "intakeDate" TIMESTAMP(3) NOT NULL,
    "mealType" "public"."MealType" NOT NULL,
    "foodName" TEXT NOT NULL,
    "portion" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_notes" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "educatorId" TEXT NOT NULL,
    "educationType" "public"."EducationType" NOT NULL,
    "topic" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "materials" TEXT[],
    "patientUnderstanding" TEXT,
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reminders" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DrugData" (
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

    CONSTRAINT "DrugData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientComplaint" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "complaint" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PatientComplaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pharmacy_notes" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT NOT NULL,
    "pharmacist" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "pharmacy_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BloodSugarHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BloodSugarHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientLog" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "comorbidities" TEXT[],
    "allergies" TEXT[],
    "currentMedications" TEXT[],

    CONSTRAINT "PatientLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrNumber_key" ON "public"."patients"("mrNumber");

-- AddForeignKey
ALTER TABLE "public"."patients" ADD CONSTRAINT "patients_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vital_signs" ADD CONSTRAINT "vital_signs_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lab_results" ADD CONSTRAINT "lab_results_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medications" ADD CONSTRAINT "medications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medications" ADD CONSTRAINT "medications_prescribedBy_fkey" FOREIGN KEY ("prescribedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_logs" ADD CONSTRAINT "medication_logs_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "public"."medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_logs" ADD CONSTRAINT "medication_logs_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medication_logs" ADD CONSTRAINT "medication_logs_loggedBy_fkey" FOREIGN KEY ("loggedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nutrition_plans" ADD CONSTRAINT "nutrition_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nutrition_plans" ADD CONSTRAINT "nutrition_plans_nutritionistId_fkey" FOREIGN KEY ("nutritionistId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."food_intakes" ADD CONSTRAINT "food_intakes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_notes" ADD CONSTRAINT "education_notes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_notes" ADD CONSTRAINT "education_notes_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientComplaint" ADD CONSTRAINT "PatientComplaint_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pharmacy_notes" ADD CONSTRAINT "pharmacy_notes_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BloodSugarHistory" ADD CONSTRAINT "BloodSugarHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientLog" ADD CONSTRAINT "PatientLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
