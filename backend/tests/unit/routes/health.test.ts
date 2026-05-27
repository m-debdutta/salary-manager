import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRouter from '../../../src/routes/health';

describe('Health Router', () => {
  const createApp = () => {
    const app = express();
    app.use(healthRouter);
    return app;
  };

  it('should export a router instance', () => {
    expect(healthRouter).toBeDefined();
    expect(typeof healthRouter).toBe('function');
  });

  it('should respond to GET /health', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return status as ok', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.body.status).toBe('ok');
  });

  it('should return valid timestamp in ISO format', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    const timestamp = response.body.timestamp;
    expect(timestamp).toBeDefined();
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('should return numeric uptime', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return environment as string', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.environment).toBe('string');
  });

  it('should return JSON content type', async () => {
    const app = createApp();
    const response = await request(app).get('/health');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return all required fields', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });
});
