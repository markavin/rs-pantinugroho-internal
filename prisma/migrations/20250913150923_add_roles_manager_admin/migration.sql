-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."UserRole" ADD VALUE 'MANAJER';
ALTER TYPE "public"."UserRole" ADD VALUE 'ADMINISTRASI';

-- CreateTable
CREATE TABLE "public"."login_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutTime" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_logs_sessionId_key" ON "public"."login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_userId_idx" ON "public"."login_logs"("userId");

-- CreateIndex
CREATE INDEX "login_logs_sessionId_idx" ON "public"."login_logs"("sessionId");

-- CreateIndex
CREATE INDEX "login_logs_loginTime_idx" ON "public"."login_logs"("loginTime");

-- CreateIndex
CREATE INDEX "login_logs_logoutTime_idx" ON "public"."login_logs"("logoutTime");

-- AddForeignKey
ALTER TABLE "public"."login_logs" ADD CONSTRAINT "login_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
