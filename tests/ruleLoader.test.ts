import fs from 'fs';
import path from 'path';
import { RuleLoader } from '../src/rules/ruleLoader';

// Mock fs and logger
jest.mock('fs');
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe('RuleLoader', () => {
    const mockRules = {
        overspeed: { escalate_if_count: 3, window_mins: 60 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset singleton instance if possible, or we just test behavior on existing instance
        // Since it's a singleton, we might need to be careful. 
        // For testing purposes, we can rely on reloading.
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockRules));
    });

    it('should load rules on initialization', () => {
        const loader = RuleLoader.getInstance();
        loader.refreshRules(); // Force reload with mocks

        const rule = loader.getRule('overspeed');
        expect(rule).toBeDefined();
        expect(rule?.escalate_if_count).toBe(3);
    });

    it('should return undefined for unknown rule', () => {
        const loader = RuleLoader.getInstance();
        const rule = loader.getRule('unknown_type');
        expect(rule).toBeUndefined();
    });

    it('should validate rule structure', () => {
        const loader = RuleLoader.getInstance();
        const isValid = loader.validateRuleStructure({ test: { some: 'config' } });
        expect(isValid).toBe(true);

        const isInvalid = loader.validateRuleStructure(null);
        expect(isInvalid).toBe(false);
    });

    it('should handle missing rules file gracefully', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        const loader = RuleLoader.getInstance();
        loader.refreshRules();

        const rule = loader.getRule('overspeed');
        expect(rule).toBeUndefined();
    });
});
