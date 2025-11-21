import { AlertProcessor } from '../src/workers/alertProcessor';
import { AlertStatus } from '../src/models/alert';
import { RuleLoader } from '../src/rules/ruleLoader';

// Mock Repository
jest.mock('../src/repositories/alertRepository', () => {
    return {
        AlertRepository: jest.fn().mockImplementation(() => {
            return {
                findOpenAlerts: jest.fn(),
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

describe('AlertProcessor', () => {
    let processor: any;
    let mockRepository: any;
    let mockRuleLoader: any;

    beforeEach(() => {
        jest.clearAllMocks();
        processor = new AlertProcessor();
        mockRepository = processor.repository;

        mockRuleLoader = {
            getRule: jest.fn(),
        };
        (RuleLoader.getInstance as jest.Mock).mockReturnValue(mockRuleLoader);
    });

    it('should auto-close alert if condition is met', async () => {
        const alert = {
            id: 'alert-1',
            sourceType: 'compliance',
            status: AlertStatus.OPEN,
            metadata: { document_valid: true },
            timestamp: new Date(),
            history: [],
        };

        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_if: 'document_valid',
        });

        await processor.processAlerts();

        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-1', expect.objectContaining({
            status: AlertStatus.AUTO_CLOSED,
            history: expect.arrayContaining([
                expect.objectContaining({ reason: 'Condition met: document_valid' })
            ])
        }));
    });

    it('should auto-close alert if expired', async () => {
        const oldDate = new Date();
        oldDate.setMinutes(oldDate.getMinutes() - 120); // 2 hours ago

        const alert = {
            id: 'alert-2',
            sourceType: 'temp_monitor',
            status: AlertStatus.OPEN,
            metadata: {},
            timestamp: oldDate,
            history: [],
        };

        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_after_mins: 60,
        });

        await processor.processAlerts();

        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-2', expect.objectContaining({
            status: AlertStatus.AUTO_CLOSED,
            history: expect.arrayContaining([
                expect.objectContaining({ reason: 'Expired after 60 mins' })
            ])
        }));
    });

    it('should NOT close alert if conditions are not met', async () => {
        const alert = {
            id: 'alert-3',
            sourceType: 'compliance',
            status: AlertStatus.OPEN,
            metadata: { document_valid: false },
            timestamp: new Date(),
            history: [],
        };

        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_if: 'document_valid',
            auto_close_after_mins: 60,
        });

        await processor.processAlerts();

        expect(mockRepository.updateAlert).not.toHaveBeenCalled();
    });
});
