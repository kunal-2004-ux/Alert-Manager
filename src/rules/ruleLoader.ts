import fs from 'fs';
import path from 'path';
import Logger from '../utils/logger';

interface Rule {
    escalate_if_count?: number;
    window_mins?: number;
    auto_close_if?: string;
    [key: string]: any;
}

export class RuleLoader {
    private static instance: RuleLoader;
    private rules: Record<string, Rule> = {};
    private readonly rulesPath: string;

    private constructor() {
        this.rulesPath = path.join(__dirname, 'rules.json');
        this.loadRules();
    }

    public static getInstance(): RuleLoader {
        if (!RuleLoader.instance) {
            RuleLoader.instance = new RuleLoader();
        }
        return RuleLoader.instance;
    }

    private loadRules(): void {
        try {
            if (!fs.existsSync(this.rulesPath)) {
                Logger.warn(`Rules file not found at ${this.rulesPath}`);
                this.rules = {};
                return;
            }

            const fileContent = fs.readFileSync(this.rulesPath, 'utf-8');
            const parsedRules = JSON.parse(fileContent);

            if (this.validateRuleStructure(parsedRules)) {
                this.rules = parsedRules;
                Logger.info('Rules loaded successfully');
            } else {
                Logger.error('Invalid rule structure encountered during load');
            }
        } catch (error: any) {
            Logger.error(`Failed to load rules: ${error.message}`);
        }
    }

    public validateRuleStructure(rules: any): boolean {
        if (typeof rules !== 'object' || rules === null) return false;

        for (const key in rules) {
            const rule = rules[key];
            if (typeof rule !== 'object' || rule === null) return false;

            // Basic validation: check if it has at least one known property or is a valid object
            // We can add stricter checks here if needed
        }
        return true;
    }

    public getRule(sourceType: string): Rule | undefined {
        return this.rules[sourceType];
    }

    public refreshRules(): void {
        Logger.info('Refreshing rules...');
        this.loadRules();
    }
}
