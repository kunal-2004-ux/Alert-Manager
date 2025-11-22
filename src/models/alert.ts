import { AlertStatus } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';

export interface Alert {
    id: string;
    driverId?: string | null;
    sourceType: string;
    category?: string | null;
    severity: string;
    timestamp: Date;
    status: AlertStatus;
    metadata: JsonValue;
    receivedAt: Date;
    history: JsonValue[];
    fingerprint?: string | null;
}

export { AlertStatus };
