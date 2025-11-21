-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ESCALATED', 'AUTO_CLOSED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "metadata" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "history" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "fingerprint" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_fingerprint_key" ON "Alert"("fingerprint");

-- CreateIndex
CREATE INDEX "Alert_sourceType_idx" ON "Alert"("sourceType");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE INDEX "Alert_timestamp_idx" ON "Alert"("timestamp");

-- CreateIndex
CREATE INDEX "Alert_metadata_idx" ON "Alert" USING GIN ("metadata");

-- CreateIndex
CREATE INDEX "AuditLog_alertId_idx" ON "AuditLog"("alertId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");
