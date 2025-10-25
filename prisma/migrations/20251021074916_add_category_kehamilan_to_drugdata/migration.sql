/*
  Warnings:

  - Made the column `categoryKehamilan` on table `drug_data` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."drug_data" ALTER COLUMN "categoryKehamilan" SET NOT NULL;
