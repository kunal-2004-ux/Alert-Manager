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
const alertProcessor_1 = require("../src/workers/alertProcessor");
const alert_1 = require("../src/models/alert");
const ruleLoader_1 = require("../src/rules/ruleLoader");
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
    let processor;
    let mockRepository;
    let mockRuleLoader;
    beforeEach(() => {
        jest.clearAllMocks();
        processor = new alertProcessor_1.AlertProcessor();
        mockRepository = processor.repository;
        mockRuleLoader = {
            getRule: jest.fn(),
        };
        ruleLoader_1.RuleLoader.getInstance.mockReturnValue(mockRuleLoader);
    });
    it('should auto-close alert if condition is met', () => __awaiter(void 0, void 0, void 0, function* () {
        const alert = {
            id: 'alert-1',
            sourceType: 'compliance',
            status: alert_1.AlertStatus.OPEN,
            metadata: { document_valid: true },
            timestamp: new Date(),
            history: [],
        };
        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_if: 'document_valid',
        });
        yield processor.processAlerts();
        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-1', expect.objectContaining({
            status: alert_1.AlertStatus.AUTO_CLOSED,
            history: expect.arrayContaining([
                expect.objectContaining({ reason: 'Condition met: document_valid' })
            ])
        }));
    }));
    it('should auto-close alert if expired', () => __awaiter(void 0, void 0, void 0, function* () {
        const oldDate = new Date();
        oldDate.setMinutes(oldDate.getMinutes() - 120); // 2 hours ago
        const alert = {
            id: 'alert-2',
            sourceType: 'temp_monitor',
            status: alert_1.AlertStatus.OPEN,
            metadata: {},
            timestamp: oldDate,
            history: [],
        };
        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_after_mins: 60,
        });
        yield processor.processAlerts();
        expect(mockRepository.updateAlert).toHaveBeenCalledWith('alert-2', expect.objectContaining({
            status: alert_1.AlertStatus.AUTO_CLOSED,
            history: expect.arrayContaining([
                expect.objectContaining({ reason: 'Expired after 60 mins' })
            ])
        }));
    }));
    it('should NOT close alert if conditions are not met', () => __awaiter(void 0, void 0, void 0, function* () {
        const alert = {
            id: 'alert-3',
            sourceType: 'compliance',
            status: alert_1.AlertStatus.OPEN,
            metadata: { document_valid: false },
            timestamp: new Date(),
            history: [],
        };
        mockRepository.findOpenAlerts.mockResolvedValue([alert]);
        mockRuleLoader.getRule.mockReturnValue({
            auto_close_if: 'document_valid',
            auto_close_after_mins: 60,
        });
        yield processor.processAlerts();
        expect(mockRepository.updateAlert).not.toHaveBeenCalled();
    }));
});
