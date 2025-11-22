import { AlertRepository } from '../repositories/alertRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { Alert, AlertStatus } from '../models/alert';
import crypto from 'crypto';
import { RuleLoader } from '../rules/ruleLoader';
import Logger from '../utils/logger';

export class AlertService {
    private repository: AlertRepository;
    private auditRepository: AuditRepository;

    constructor() {
        this.repository = new AlertRepository();
        this.auditRepository = new AuditRepository();
    }

    private generateFingerprint(data: any): string {
        const driverId = data.metadata?.driverId || '';
        const payload = `${driverId}-${data.sourceType}-${data.timestamp.toISOString()}`;
        return crypto.createHash('sha256').update(payload).digest('hex');
    }

    async createAlert(data: any): Promise<Alert> {
        if (!data.sourceType || !data.severity || !data.timestamp) {
            throw new Error('Missing required fields: sourceType, severity, timestamp');
        }

        const normalizedData = {
            ...data,
            sourceType: data.sourceType.toLowerCase(),
            severity: data.severity.toUpperCase(),
            status: data.status ? data.status.toUpperCase() : AlertStatus.OPEN,
            timestamp: new Date(data.timestamp),
            receivedAt: new Date(),
        };

        if (data.alertId) {
            const existing = await this.repository.findById(data.alertId);
            if (existing) return existing;
            normalizedData.id = data.alertId;
        } else {
            const fingerprint = this.generateFingerprint(normalizedData);
            const existing = await this.repository.findByFingerprint(fingerprint);
            if (existing) return existing;
            normalizedData.fingerprint = fingerprint;
        }

        const alert = await this.repository.createAlert(normalizedData);

        Logger.info('Alert created', { alertId: alert.id, sourceType: alert.sourceType, severity: alert.severity });
        await this.auditRepository.createAuditLog(alert.id, 'CREATED', { sourceType: alert.sourceType, severity: alert.severity });

        try {
            await this.applyEscalationRules(alert);
            const updatedAlert = await this.repository.findById(alert.id);
            return updatedAlert || alert;
        } catch (error: any) {
            Logger.error(`Failed to apply escalation rules: ${error.message}`);
            return alert;
        }
    }

    private async applyEscalationRules(alert: Alert): Promise<void> {
        const ruleLoader = RuleLoader.getInstance();
        const rule = ruleLoader.getRule(alert.sourceType);
        if (!rule) return;

        Logger.info('Evaluating escalation rule', { alertId: alert.id, sourceType: alert.sourceType, rule: rule.sourceType });

        if (rule.escalate_if_count && rule.window_mins) {
            const windowStart = new Date(alert.timestamp.getTime() - rule.window_mins * 60 * 1000);
            const metadataFilter: any = {};
            if (alert.metadata && (alert.metadata as any).driverId) {
                metadataFilter.driverId = (alert.metadata as any).driverId;
            }

            const count = await this.repository.countAlerts(alert.sourceType, windowStart, metadataFilter);

            if (count >= rule.escalate_if_count) {
                Logger.info('Escalating alert', { alertId: alert.id, count, threshold: rule.escalate_if_count });

                const historyEntry = {
                    from: alert.status,
                    to: AlertStatus.ESCALATED,
                    timestamp: new Date(),
                    ruleTriggered: true,
                    rule: rule
                };

                const currentHistory = Array.isArray(alert.history) ? alert.history : [];
                const updatedHistory = [...currentHistory, historyEntry];

                await this.repository.updateAlert(alert.id, {
                    status: AlertStatus.ESCALATED,
                    history: updatedHistory as any
                });

                await this.auditRepository.createAuditLog(alert.id, 'RULE_TRIGGERED', { rule: rule.sourceType, count, threshold: rule.escalate_if_count });
                await this.auditRepository.createAuditLog(alert.id, 'STATUS_CHANGED', { from: 'OPEN', to: 'ESCALATED' });
            }
        }
    }

    async createBatch(alerts: any[]): Promise<Alert[]> {
        const results = [];
        for (const alert of alerts) {
            try {
                const result = await this.createAlert(alert);
                results.push(result);
            } catch (error: any) {
                results.push({ error: error.message, alert } as any);
            }
        }
        return results;
    }

    async resolveAlert(id: string): Promise<Alert> {
        const alert = await this.repository.findById(id);
        if (!alert) {
            throw new Error('Alert not found');
        }

        if (alert.status === AlertStatus.AUTO_CLOSED || alert.status === AlertStatus.RESOLVED) {
            throw new Error(`Alert is already ${alert.status}`);
        }

        const historyEntry = {
            from: alert.status,
            to: AlertStatus.RESOLVED,
            timestamp: new Date(),
            action: 'manual_resolve'
        };

        const currentHistory = Array.isArray(alert.history) ? alert.history : [];
        const updatedHistory = [...currentHistory, historyEntry];

        const updated = await this.repository.updateAlert(id, {
            status: AlertStatus.RESOLVED,
            history: updatedHistory as any
        });

        Logger.info('Alert resolved', { alertId: id, previousStatus: alert.status });
        await this.auditRepository.createAuditLog(id, 'RESOLVED', { from: alert.status });
        await this.auditRepository.createAuditLog(id, 'STATUS_CHANGED', { from: alert.status, to: 'RESOLVED' });

        return updated;
    }

    async getDashboardSummary() {
        return this.repository.getAlertSummary();
    }

    async getTopDrivers(limit: number = 5) {
        return this.repository.getTopDrivers(limit);
    }

    async getAutoClosedAlerts(timeFilter?: string) {
        let since: Date | undefined;
        if (timeFilter === '24h') {
            since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        } else if (timeFilter === '7d') {
            since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        return this.repository.getAutoClosedAlerts(since);
    }

    async getAlertDetails(id: string) {
        const alert = await this.repository.findById(id);
        if (!alert) {
            throw new Error('Alert not found');
        }
        return alert;
    }

    async getDashboardTrends() {
        return this.repository.getAlertTrends();
    }

    async getRecentEvents() {
        return this.repository.getRecentEvents();
    }
}
