import { AlertRepository } from '../repositories/alertRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { RuleLoader } from '../rules/ruleLoader';
import { AlertStatus } from '../models/alert';
import Logger from '../utils/logger';

export class AlertProcessor {
    private repository: AlertRepository;
    private auditRepository: AuditRepository;

    constructor() {
        this.repository = new AlertRepository();
        this.auditRepository = new AuditRepository();
    }

    async processAlerts(): Promise<void> {
        const startTime = new Date();
        Logger.info('Worker run started', { timestamp: startTime.toISOString() });
        try {
            const openAlerts = await this.repository.findOpenAlerts();
            Logger.info('Scanning alerts for auto-closure', { count: openAlerts.length });

            const ruleLoader = RuleLoader.getInstance();

            for (const alert of openAlerts) {
                const rule = ruleLoader.getRule(alert.sourceType);
                if (!rule) continue;

                let shouldClose = false;
                let closeReason = '';

                // Check auto_close_if condition
                if (rule.auto_close_if && alert.metadata) {
                    // Example: "document_valid" -> check if metadata.document_valid === true
                    // This is a simplified check. In a real system, this might be more complex expression evaluation.
                    // For this assignment, we assume the rule string maps to a boolean key in metadata.
                    const key = rule.auto_close_if;
                    if ((alert.metadata as any)[key] === true) {
                        shouldClose = true;
                        closeReason = `Condition met: ${key}`;
                    }
                }

                // Check time-based expiry
                if (!shouldClose && rule.auto_close_after_mins) {
                    const alertTime = new Date(alert.timestamp).getTime();
                    const now = new Date().getTime();
                    const diffMins = (now - alertTime) / (1000 * 60);

                    if (diffMins >= rule.auto_close_after_mins) {
                        shouldClose = true;
                        closeReason = `Expired after ${rule.auto_close_after_mins} mins`;
                    }
                }

                if (shouldClose) {
                    Logger.info('Auto-closing alert', { alertId: alert.id, reason: closeReason, previousStatus: alert.status });

                    const historyEntry = {
                        from: alert.status,
                        to: AlertStatus.AUTO_CLOSED,
                        timestamp: new Date().toISOString(),
                        reason: closeReason
                    };

                    const currentHistory = Array.isArray(alert.history) ? alert.history : [];
                    const updatedHistory = [...currentHistory, historyEntry];

                    await this.repository.updateAlert(alert.id, {
                        status: AlertStatus.AUTO_CLOSED,
                        history: updatedHistory
                    });

                    // Audit trail
                    await this.auditRepository.createAuditLog(alert.id, 'AUTO_CLOSED', { reason: closeReason });
                    await this.auditRepository.createAuditLog(alert.id, 'STATUS_CHANGED', { from: alert.status, to: 'AUTO_CLOSED' });
                }
            }
        } catch (error: any) {
            Logger.error('Worker run failed', { error: error.message, stack: error.stack });
        }
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        Logger.info('Worker run completed', { timestamp: endTime.toISOString(), durationMs: duration });
    }
}
