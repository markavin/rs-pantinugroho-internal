-- AlterTable
ALTER TABLE "public"."handled_patients" ADD COLUMN     "status" "public"."HandledPatientStatus" NOT NULL DEFAULT 'SEDANG_DITANGANI';
