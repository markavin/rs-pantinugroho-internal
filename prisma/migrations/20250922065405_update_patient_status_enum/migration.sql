/*
  Warnings:

  - The values [INACTIVE,MONITORING,FOLLOW_UP] on the enum `PatientStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PatientStatus_new" AS ENUM ('ACTIVE', 'RUJUK_BALIK', 'SELESAI');
ALTER TABLE "public"."patients" ALTER COLUMN "status" TYPE "public"."PatientStatus_new" USING ("status"::text::"public"."PatientStatus_new");
ALTER TYPE "public"."PatientStatus" RENAME TO "PatientStatus_old";
ALTER TYPE "public"."PatientStatus_new" RENAME TO "PatientStatus";
DROP TYPE "public"."PatientStatus_old";
COMMIT;
