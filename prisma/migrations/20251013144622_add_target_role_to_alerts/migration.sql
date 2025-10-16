-- DropForeignKey
ALTER TABLE "public"."alerts" DROP CONSTRAINT "alerts_patientId_fkey";

-- AlterTable
ALTER TABLE "public"."alerts" ADD COLUMN     "targetRole" "public"."UserRole",
ALTER COLUMN "patientId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "alerts_targetRole_idx" ON "public"."alerts"("targetRole");

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
