import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupMiddleware } from '../../../src/middleware';
import healthRouter from '../../../src/routes/health';

// Create a test app with the health endpoint
const createTestApp = () => {
  const app = express();
  setupMiddleware(app);
  app.use(healthRouter);
  return app;
};

describe('Health Check Endpoint', () => {
  it('should return 200 status code', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return correct response structure', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return status as ok', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');
    expect(response.body.status).toBe('ok');
  });

  it('should return valid ISO timestamp', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');

    const timestamp = response.body.timestamp;
    expect(timestamp).toBeDefined();
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('should return numeric uptime', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return environment', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');
    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.environment).toBe('string');
  });

  it('should have correct content type', async () => {
    const app = createTestApp();
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
