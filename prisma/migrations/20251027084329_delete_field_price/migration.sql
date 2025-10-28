/*
  Warnings:

  - You are about to drop the column `price` on the `drug_data` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `drug_transaction_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `drug_transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."drug_data" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "public"."drug_transaction_items" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "public"."drug_transactions" DROP COLUMN "totalAmount";
