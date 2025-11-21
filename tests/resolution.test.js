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
    let alertService;
    let mockRepository;
    beforeEach(() => {
        jest.clearAllMocks();
        alertService = new alertService_1.AlertService();
        mockRepository = alertService.repository;
    });
    it('should resolve an open alert', () => __awaiter(void 0, void 0, void 0, function* () {
        const alert = {
            id: 'alert-1',
            status: alert_1.AlertStatus.OPEN,
            history: [],
        };
        mockRepository.findById.mockResolvedValue(alert);
        mockRepository.updateAlert.mockResolvedValue(Object.assign(Object.assign({}, alert), { status: alert_1.AlertStatus.RESOLVED, history: [{ from: 'OPEN', to: 'RESOLVED', timestamp: new Date(), action: 'manual_resolve' }] }));
        const result = yield alertService.resolveAlert('alert-1');
        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-1', expect.objectContaining({
            status: alert_1.AlertStatus.RESOLVED,
            history: expect.arrayContaining([
                expect.objectContaining({ action: 'manual_resolve' })
            ])
        }));
        expect(result.status).toBe(alert_1.AlertStatus.RESOLVED);
    }));
    it('should throw error if alert not found', () => __awaiter(void 0, void 0, void 0, function* () {
        mockRepository.findById.mockResolvedValue(null);
        yield expect(alertService.resolveAlert('unknown')).rejects.toThrow('Alert not found');
    }));
    it('should throw error if alert is already closed', () => __awaiter(void 0, void 0, void 0, function* () {
        const alert = {
            id: 'alert-2',
            status: alert_1.AlertStatus.AUTO_CLOSED,
            history: [],
        };
        mockRepository.findById.mockResolvedValue(alert);
        yield expect(alertService.resolveAlert('alert-2')).rejects.toThrow('Alert is already AUTO_CLOSED');
    }));
});
