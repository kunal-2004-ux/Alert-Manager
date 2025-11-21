import { AlertService } from '../src/services/alertService';
import { AlertStatus } from '../src/models/alert';
import { RuleLoader } from '../src/rules/ruleLoader';

// Mock the repository module
jest.mock('../src/repositories/alertRepository', () => {
    return {
        AlertRepository: jest.fn().mockImplementation(() => {
            return {
                createAlert: jest.fn(),
                findById: jest.fn(),
                findByFingerprint: jest.fn(),
                countAlerts: jest.fn(),
                updateAlert: jest.fn(),
            };
        }),
    };
});

// Mock RuleLoader
jest.mock('../src/rules/ruleLoader', () => ({
    RuleLoader: {
        getInstance: jest.fn(),
    },
}));

describe('AlertService - Escalation', () => {
    let alertService: any;
    let mockRepository: any;
    let mockRuleLoader: any;

    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new AlertService();
        mockRepository = alertService.repository;

        mockRuleLoader = {
            getRule: jest.fn(),
        };
        (RuleLoader.getInstance as jest.Mock).mockReturnValue(mockRuleLoader);
    });

    it('should escalate alert if count exceeds threshold', async () => {
        const alertData = {
            sourceType: 'overspeed',
            severity: 'warning',
            timestamp: '2023-01-01T10:00:00.000Z',
            metadata: { driverId: 'd1' },
        };

        // 1. Setup Rule
        mockRuleLoader.getRule.mockReturnValue({
            escalate_if_count: 3,
            window_mins: 60,
        });

        // 2. Mock Repository Responses
        mockRepository.findByFingerprint.mockResolvedValue(null); // No duplicate

        const createdAlert = {
            id: 'alert-3',
            sourceType: 'overspeed',
            severity: 'WARNING',
            timestamp: new Date(alertData.timestamp),
            status: AlertStatus.OPEN,
            metadata: alertData.metadata,
            receivedAt: new Date(),
            history: [],
            fingerprint: 'hash-3',
        };
        mockRepository.createAlert.mockResolvedValue(createdAlert);

        // Mock countAlerts to return 3 (including this one, or 3 found in window)
        // The logic checks if count >= escalate_if_count (3).
        mockRepository.countAlerts.mockResolvedValue(3);

        // Mock updateAlert
        mockRepository.updateAlert.mockResolvedValue({
            ...createdAlert,
            status: AlertStatus.ESCALATED,
            history: [{ from: 'OPEN', to: 'ESCALATED', timestamp: new Date(), ruleTriggered: true }],
        });

        // Mock findById to return the updated alert
        mockRepository.findById.mockResolvedValue({
            ...createdAlert,
            status: AlertStatus.ESCALATED,
            history: [{ from: 'OPEN', to: 'ESCALATED', timestamp: new Date(), ruleTriggered: true }],
        });

        // 3. Execute
        const result = await alertService.createAlert(alertData);

        // 4. Verify
        expect(mockRuleLoader.getRule).toHaveBeenCalledWith('overspeed');
        expect(mockRepository.countAlerts).toHaveBeenCalled();
        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-3', expect.objectContaining({
            status: AlertStatus.ESCALATED
        }));
        expect(result.status).toBe(AlertStatus.ESCALATED);
    });

    it('should NOT escalate if count is below threshold', async () => {
        const alertData = {
            sourceType: 'overspeed',
            severity: 'warning',
            timestamp: '2023-01-01T10:00:00.000Z',
            metadata: { driverId: 'd1' },
        };

        mockRuleLoader.getRule.mockReturnValue({
            escalate_if_count: 3,
            window_mins: 60,
        });

        mockRepository.findByFingerprint.mockResolvedValue(null);

        const createdAlert = {
            id: 'alert-1',
            sourceType: 'overspeed',
            severity: 'WARNING',
            timestamp: new Date(alertData.timestamp),
            status: AlertStatus.OPEN,
            metadata: alertData.metadata,
            receivedAt: new Date(),
            history: [],
            fingerprint: 'hash-1',
        };
        mockRepository.createAlert.mockResolvedValue(createdAlert);

        // Count is 1
        mockRepository.countAlerts.mockResolvedValue(1);

        // Mock findById to return the original alert (since no update happened)
        mockRepository.findById.mockResolvedValue(createdAlert);

        const result = await alertService.createAlert(alertData);

        expect(mockRepository.updateAlert).not.toHaveBeenCalled();
        expect(result.status).toBe(AlertStatus.OPEN);
    });
});
