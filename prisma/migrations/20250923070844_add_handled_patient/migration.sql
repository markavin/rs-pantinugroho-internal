-- CreateEnum
CREATE TYPE "public"."HandledPatientStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'TRANSFERRED', 'DISCONTINUED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."HandledPatientPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."handled_patients" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "handledBy" TEXT NOT NULL,
    "handledDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "notes" TEXT,
    "status" "public"."HandledPatientStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" "public"."HandledPatientPriority" NOT NULL DEFAULT 'NORMAL',
    "nextVisitDate" TIMESTAMP(3),
    "estimatedDuration" TEXT,
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handled_patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "handled_patients_handledBy_idx" ON "public"."handled_patients"("handledBy");

-- CreateIndex
CREATE INDEX "handled_patients_patientId_idx" ON "public"."handled_patients"("patientId");

-- CreateIndex
CREATE INDEX "handled_patients_status_idx" ON "public"."handled_patients"("status");

-- CreateIndex
CREATE UNIQUE INDEX "handled_patients_patientId_handledBy_status_key" ON "public"."handled_patients"("patientId", "handledBy", "status");

-- AddForeignKey
ALTER TABLE "public"."handled_patients" ADD CONSTRAINT "handled_patients_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handled_patients" ADD CONSTRAINT "handled_patients_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
