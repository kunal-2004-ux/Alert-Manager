"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const alertService_1 = require("../src/services/alertService");
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
    let alertService;
    let mockRepository;
    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new alertService_1.AlertService();
        mockRepository = alertService.repository;
    });
    it('should create a new alert if no duplicate exists', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield alertService.createAlert(alertData);
        expect(mockRepository.findByFingerprint).toHaveBeenCalled();
        expect(mockRepository.createAlert).toHaveBeenCalled();
        expect(result.id).toBe('new-id');
    }));
    it('should return existing alert if fingerprint matches (Idempotency)', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield alertService.createAlert(alertData);
        expect(mockRepository.findByFingerprint).toHaveBeenCalled();
        expect(mockRepository.createAlert).not.toHaveBeenCalled();
        expect(result.id).toBe('existing-id');
    }));
    it('should return existing alert if alertId is provided and exists', () => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield alertService.createAlert(alertData);
        expect(mockRepository.findById).toHaveBeenCalledWith('existing-id');
        expect(mockRepository.createAlert).not.toHaveBeenCalled();
        expect(result.id).toBe('existing-id');
    }));
});
