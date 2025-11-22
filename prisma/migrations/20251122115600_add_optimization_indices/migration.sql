-- CreateIndex
CREATE INDEX "Alert_fingerprint_timestamp_idx" ON "Alert"("fingerprint", "timestamp");

-- CreateIndex
CREATE INDEX "Alert_status_timestamp_idx" ON "Alert"("status", "timestamp");
