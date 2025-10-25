-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "lastEnergyCalculation" JSONB,
ADD COLUMN     "latestEnergyRequirement" INTEGER;

-- AlterTable
ALTER TABLE "public"."visitations" ADD COLUMN     "energyCalculationDetail" JSONB,
ADD COLUMN     "energyRequirement" INTEGER;
