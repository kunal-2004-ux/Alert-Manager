import { AlertService } from '../src/services/alertService';

// Mock the repository module
jest.mock('../src/repositories/alertRepository', () => {
    return {
        AlertRepository: jest.fn().mockImplementation(() => {
            return {
                createAlert: jest.fn(),
                findById: jest.fn(),
                findByFingerprint: jest.fn(),
            };
        }),
    };
});

describe('AlertService', () => {
    let alertService: any;
    let mockRepository: any;

    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new AlertService();
        mockRepository = alertService.repository;
    });

    it('should create a new alert if no duplicate exists', async () => {
        const alertData = {
            sourceType: 'monitor',
            severity: 'critical',
            timestamp: '2023-01-01T00:00:00.000Z',
            metadata: { driverId: 'd1' },
        };

        mockRepository.findByFingerprint.mockResolvedValue(null);

        const fullAlert = {
            id: 'new-id',
            sourceType: 'monitor',
            severity: 'CRITICAL',
            timestamp: new Date(alertData.timestamp),
            status: 'OPEN', // Cast to any if needed, but string usually works if enum matches
            metadata: alertData.metadata,
            receivedAt: new Date(),
            history: [],
            fingerprint: 'some-hash',
        };

        mockRepository.createAlert.mockResolvedValue(fullAlert);

        const result = await alertService.createAlert(alertData);

        expect(mockRepository.findByFingerprint).toHaveBeenCalled();
        expect(mockRepository.createAlert).toHaveBeenCalled();
        expect(result.id).toBe('new-id');
    });

    it('should return existing alert if fingerprint matches (Idempotency)', async () => {
        const alertData = {
            sourceType: 'monitor',
            severity: 'critical',
            timestamp: '2023-01-01T00:00:00.000Z',
            metadata: { driverId: 'd1' },
        };

        const existingAlert = {
            id: 'existing-id',
            sourceType: 'monitor',
            severity: 'CRITICAL',
            timestamp: new Date(alertData.timestamp),
            status: 'OPEN',
            metadata: alertData.metadata,
            receivedAt: new Date(),
            history: [],
            fingerprint: 'some-hash',
        };

        mockRepository.findByFingerprint.mockResolvedValue(existingAlert);

        const result = await alertService.createAlert(alertData);

        expect(mockRepository.findByFingerprint).toHaveBeenCalled();
        expect(mockRepository.createAlert).not.toHaveBeenCalled();
        expect(result.id).toBe('existing-id');
    });

    it('should return existing alert if alertId is provided and exists', async () => {
        const alertData = {
            alertId: 'existing-id',
            sourceType: 'monitor',
            severity: 'critical',
            timestamp: '2023-01-01T00:00:00.000Z',
        };

        const existingAlert = {
            id: 'existing-id',
            sourceType: 'monitor',
            severity: 'CRITICAL',
            timestamp: new Date(alertData.timestamp),
            status: 'OPEN',
            metadata: {},
            receivedAt: new Date(),
            history: [],
            fingerprint: 'some-hash',
        };

        mockRepository.findById.mockResolvedValue(existingAlert);

        const result = await alertService.createAlert(alertData);

        expect(mockRepository.findById).toHaveBeenCalledWith('existing-id');
        expect(mockRepository.createAlert).not.toHaveBeenCalled();
        expect(result.id).toBe('existing-id');
    });
});
