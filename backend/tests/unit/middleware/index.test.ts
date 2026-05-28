import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupMiddleware } from '../../../src/middleware';

describe('Middleware Setup', () => {
  it('should be a function', () => {
    expect(setupMiddleware).toBeDefined();
    expect(typeof setupMiddleware).toBe('function');
  });

  it('should not throw when called with valid Express app', () => {
    const app = express();
    expect(() => setupMiddleware(app)).not.toThrow();
  });

  it('should add CORS headers to responses', async () => {
    const app = express();
    setupMiddleware(app);
    app.get('/test', (_req, res) => res.json({ ok: true }));

    const response = await request(app).get('/test');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should parse JSON request bodies', async () => {
    const app = express();
    setupMiddleware(app);
    app.post('/test', (req, res) => res.json(req.body));

    const response = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ foo: 'bar' });

    expect(response.body).toEqual({ foo: 'bar' });
  });
});
