-- CreateEnum
CREATE TYPE "public"."SmokingStatus" AS ENUM ('TIDAK_MEROKOK', 'PEROKOK', 'MANTAN_PEROKOK');

-- AlterTable
ALTER TABLE "public"."patients" ADD COLUMN     "smokingStatus" "public"."SmokingStatus";
