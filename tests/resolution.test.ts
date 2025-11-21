import { AlertService } from '../src/services/alertService';
import { AlertStatus } from '../src/models/alert';

// Mock Repository
jest.mock('../src/repositories/alertRepository', () => {
    return {
        AlertRepository: jest.fn().mockImplementation(() => {
            return {
                findById: jest.fn(),
                updateAlert: jest.fn(),
            };
        }),
    };
});

// Mock RuleLoader (needed because AlertService imports it)
jest.mock('../src/rules/ruleLoader', () => ({
    RuleLoader: {
        getInstance: jest.fn().mockReturnValue({ getRule: jest.fn() }),
    },
}));

describe('AlertService - Resolution', () => {
    let alertService: any;
    let mockRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new AlertService();
        mockRepository = alertService.repository;
    });

    it('should resolve an open alert', async () => {
        const alert = {
            id: 'alert-1',
            status: AlertStatus.OPEN,
            history: [],
        };

        mockRepository.findById.mockResolvedValue(alert);
        mockRepository.updateAlert.mockResolvedValue({
            ...alert,
            status: AlertStatus.RESOLVED,
            history: [{ from: 'OPEN', to: 'RESOLVED', timestamp: new Date(), action: 'manual_resolve' }]
        });

        const result = await alertService.resolveAlert('alert-1');

        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-1', expect.objectContaining({
            status: AlertStatus.RESOLVED,
            history: expect.arrayContaining([
                expect.objectContaining({ action: 'manual_resolve' })
            ])
        }));
        expect(result.status).toBe(AlertStatus.RESOLVED);
    });

    it('should throw error if alert not found', async () => {
        mockRepository.findById.mockResolvedValue(null);

        await expect(alertService.resolveAlert('unknown')).rejects.toThrow('Alert not found');
    });

    it('should throw error if alert is already closed', async () => {
        const alert = {
            id: 'alert-2',
            status: AlertStatus.AUTO_CLOSED,
            history: [],
        };

        mockRepository.findById.mockResolvedValue(alert);

        await expect(alertService.resolveAlert('alert-2')).rejects.toThrow('Alert is already AUTO_CLOSED');
    });
});
