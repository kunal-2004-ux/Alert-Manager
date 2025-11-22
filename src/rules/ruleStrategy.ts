import { Alert } from '@prisma/client';

export interface IRule {
    evaluate(alert: Alert): Promise<boolean>;
}

export class EscalationRule implements IRule {
    async evaluate(alert: Alert): Promise<boolean> {
        // Logic: If 3 alerts from same source in 5 mins -> Return true (Escalate)
        // Simplified for demo:
        return alert.severity === 'HIGH';
    }
}

export class AutoCloseRule implements IRule {
    async evaluate(alert: Alert): Promise<boolean> {
        // Logic: If status is 'INFO' -> Return true (Auto-Close)
        return alert.severity === 'LOW';
    }
}
