import NodeCache from 'node-cache';
import Logger from '../utils/logger';

class CacheService {
    private cache: NodeCache;

    constructor(ttlSeconds: number = 60) {
        this.cache = new NodeCache({
            stdTTL: ttlSeconds,
            checkperiod: ttlSeconds * 0.2,
            useClones: false
        });
    }

    get<T>(key: string): T | undefined {
        const value = this.cache.get<T>(key);
        if (value) {
            Logger.info(`Cache HIT for key: ${key}`);
        } else {
            Logger.info(`Cache MISS for key: ${key}`);
        }
        return value;
    }

    set<T>(key: string, value: T, ttl?: number): boolean {
        return this.cache.set(key, value, ttl || 0); // 0 = use default TTL
    }

    del(keys: string | string[]): number {
        return this.cache.del(keys);
    }

    flush(): void {
        this.cache.flushAll();
    }

    // Invalidate specific dashboard caches
    invalidateTopDrivers(): void {
        const keys = this.cache.keys().filter(k => k.startsWith('top_drivers_'));
        if (keys.length > 0) {
            this.del(keys);
            Logger.info('Invalidated top drivers cache');
        }
    }

    invalidateSummary(): void {
        this.del('dashboard_summary');
        Logger.info('Invalidated dashboard summary cache');
    }

    invalidateTrends(): void {
        const keys = this.cache.keys().filter(k => k.startsWith('alert_trends_'));
        if (keys.length > 0) {
            this.del(keys);
            Logger.info('Invalidated alert trends cache');
        }
    }

    invalidateAll(): void {
        this.flush();
        Logger.info('Invalidated all dashboard caches');
    }
}

// Export a singleton instance with default 30s TTL for dashboard data
export const dashboardCache = new CacheService(30);
export default CacheService;
