-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."drug_transactions" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "drug_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drug_transaction_items" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "drug_transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drug_transactions_patientId_idx" ON "public"."drug_transactions"("patientId");

-- CreateIndex
CREATE INDEX "drug_transactions_status_idx" ON "public"."drug_transactions"("status");

-- CreateIndex
CREATE INDEX "drug_transactions_createdAt_idx" ON "public"."drug_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "drug_transaction_items_transactionId_idx" ON "public"."drug_transaction_items"("transactionId");

-- CreateIndex
CREATE INDEX "drug_transaction_items_drugId_idx" ON "public"."drug_transaction_items"("drugId");

-- AddForeignKey
ALTER TABLE "public"."drug_transactions" ADD CONSTRAINT "drug_transactions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drug_transaction_items" ADD CONSTRAINT "drug_transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."drug_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."drug_transaction_items" ADD CONSTRAINT "drug_transaction_items_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "public"."drug_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
