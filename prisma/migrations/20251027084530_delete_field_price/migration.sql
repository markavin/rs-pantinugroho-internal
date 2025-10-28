/*
  Warnings:

  - You are about to drop the column `subtotal` on the `drug_transaction_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."drug_transaction_items" DROP COLUMN "subtotal";
