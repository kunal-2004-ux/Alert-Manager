import request from 'supertest';
import dotenv from 'dotenv';
dotenv.config();

// Mock the AlertService BEFORE importing app
jest.mock('../src/services/alertService', () => {
    return {
        AlertService: jest.fn().mockImplementation(() => {
            return {
                getDashboardTrends: jest.fn().mockResolvedValue([
                    { date: '2023-10-26T00:00:00.000Z', status: 'OPEN', count: 5 }
                ]),
                getRecentEvents: jest.fn().mockResolvedValue([
                    { id: '1', action: 'CREATED', timestamp: new Date().toISOString() }
                ])
            };
        })
    };
});

import app from '../src/app';

describe('Dashboard Features API', () => {
    it('GET /api/dashboard/trends should return trend data', async () => {
        const res = await request(app).get('/api/dashboard/trends');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('date');
            expect(res.body[0]).toHaveProperty('status');
            expect(res.body[0]).toHaveProperty('count');
        }
    });

    it('GET /api/dashboard/events should return recent events', async () => {
        const res = await request(app).get('/api/dashboard/events');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('action');
            expect(res.body[0]).toHaveProperty('timestamp');
        }
    });
});
