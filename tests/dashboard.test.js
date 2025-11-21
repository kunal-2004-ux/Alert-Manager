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
const alert_1 = require("../src/models/alert");
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
    let alertService;
    let mockRepository;
    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new alertService_1.AlertService();
        mockRepository = alertService.repository;
    });
    it('should return alert summary', () => __awaiter(void 0, void 0, void 0, function* () {
        const summary = { byStatus: { OPEN: 5 }, bySeverity: { high: 2 } };
        mockRepository.getAlertSummary.mockResolvedValue(summary);
        const result = yield alertService.getDashboardSummary();
        expect(result).toEqual(summary);
        expect(mockRepository.getAlertSummary).toHaveBeenCalled();
    }));
    it('should return top drivers', () => __awaiter(void 0, void 0, void 0, function* () {
        const drivers = [{ driverId: 'd1', count: 10 }];
        mockRepository.getTopDrivers.mockResolvedValue(drivers);
        const result = yield alertService.getTopDrivers(5);
        expect(result).toEqual(drivers);
        expect(mockRepository.getTopDrivers).toHaveBeenCalledWith(5);
    }));
    it('should return auto-closed alerts with filter', () => __awaiter(void 0, void 0, void 0, function* () {
        const alerts = [{ id: '1', status: alert_1.AlertStatus.AUTO_CLOSED }];
        mockRepository.getAutoClosedAlerts.mockResolvedValue(alerts);
        yield alertService.getAutoClosedAlerts('24h');
        // Check if date was passed (approximately 24h ago)
        const callArg = mockRepository.getAutoClosedAlerts.mock.calls[0][0];
        expect(callArg).toBeInstanceOf(Date);
        const now = new Date().getTime();
        const diff = now - callArg.getTime();
        // Allow small delta
        expect(Math.abs(diff - 24 * 60 * 60 * 1000)).toBeLessThan(1000);
    }));
    it('should return alert details', () => __awaiter(void 0, void 0, void 0, function* () {
        const alert = { id: '1', status: alert_1.AlertStatus.OPEN };
        mockRepository.findById.mockResolvedValue(alert);
        const result = yield alertService.getAlertDetails('1');
        expect(result).toEqual(alert);
    }));
    it('should throw error if alert details not found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRepository.findById.mockResolvedValue(null);
        yield expect(alertService.getAlertDetails('999')).rejects.toThrow('Alert not found');
    }));
});
