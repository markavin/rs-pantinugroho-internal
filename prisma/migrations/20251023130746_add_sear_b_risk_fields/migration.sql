-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "searBLastCalculated" TIMESTAMP(3),
ADD COLUMN     "searBRiskLevel" TEXT,
ADD COLUMN     "searBRiskPercentage" DOUBLE PRECISION;
