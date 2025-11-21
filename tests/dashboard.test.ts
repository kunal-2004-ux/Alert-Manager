import { AlertService } from '../src/services/alertService';
import { AlertStatus } from '../src/models/alert';

// Mock Repository
jest.mock('../src/repositories/alertRepository', () => {
    return {
        AlertRepository: jest.fn().mockImplementation(() => {
            return {
                getAlertSummary: jest.fn(),
                getTopDrivers: jest.fn(),
                getAutoClosedAlerts: jest.fn(),
                findById: jest.fn(),
            };
        }),
    };
});

// Mock RuleLoader
jest.mock('../src/rules/ruleLoader', () => ({
    RuleLoader: {
        getInstance: jest.fn().mockReturnValue({ getRule: jest.fn() }),
    },
}));

describe('AlertService - Dashboard', () => {
    let alertService: any;
    let mockRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new AlertService();
        mockRepository = alertService.repository;
    });

    it('should return alert summary', async () => {
        const summary = { byStatus: { OPEN: 5 }, bySeverity: { high: 2 } };
        mockRepository.getAlertSummary.mockResolvedValue(summary);

        const result = await alertService.getDashboardSummary();
        expect(result).toEqual(summary);
        expect(mockRepository.getAlertSummary).toHaveBeenCalled();
    });

    it('should return top drivers', async () => {
        const drivers = [{ driverId: 'd1', count: 10 }];
        mockRepository.getTopDrivers.mockResolvedValue(drivers);

        const result = await alertService.getTopDrivers(5);
        expect(result).toEqual(drivers);
        expect(mockRepository.getTopDrivers).toHaveBeenCalledWith(5);
    });

    it('should return auto-closed alerts with filter', async () => {
        const alerts = [{ id: '1', status: AlertStatus.AUTO_CLOSED }];
        mockRepository.getAutoClosedAlerts.mockResolvedValue(alerts);

        await alertService.getAutoClosedAlerts('24h');

        // Check if date was passed (approximately 24h ago)
        const callArg = mockRepository.getAutoClosedAlerts.mock.calls[0][0];
        expect(callArg).toBeInstanceOf(Date);
        const now = new Date().getTime();
        const diff = now - callArg.getTime();
        // Allow small delta
        expect(Math.abs(diff - 24 * 60 * 60 * 1000)).toBeLessThan(1000);
    });

    it('should return alert details', async () => {
        const alert = { id: '1', status: AlertStatus.OPEN };
        mockRepository.findById.mockResolvedValue(alert);

        const result = await alertService.getAlertDetails('1');
        expect(result).toEqual(alert);
    });

    it('should throw error if alert details not found', async () => {
        mockRepository.findById.mockResolvedValue(null);
        await expect(alertService.getAlertDetails('999')).rejects.toThrow('Alert not found');
    });
});
