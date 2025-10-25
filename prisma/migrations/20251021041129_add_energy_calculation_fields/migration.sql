/*
  Warnings:

  - You are about to drop the column `vitalSigns` on the `visitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "lastHeightUpdate" TIMESTAMP(3),
ADD COLUMN     "lastWeightUpdate" TIMESTAMP(3),
ADD COLUMN     "latestBMI" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."visitations" DROP COLUMN "vitalSigns",
ADD COLUMN     "activityLevel" TEXT,
ADD COLUMN     "basalMetabolicRate" INTEGER,
ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "bloodSugar" INTEGER,
ADD COLUMN     "calculatedBBI" DOUBLE PRECISION,
ADD COLUMN     "calculatedBMI" DOUBLE PRECISION,
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "nutritionStatus" TEXT,
ADD COLUMN     "oxygenSaturation" INTEGER,
ADD COLUMN     "respiratoryRate" INTEGER,
ADD COLUMN     "stressFactor" DOUBLE PRECISION,
ADD COLUMN     "stressLevel" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION;
