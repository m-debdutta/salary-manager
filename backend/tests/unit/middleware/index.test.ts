import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupMiddleware } from '../../../src/middleware';

const ALLOWED = 'https://salary-manager.example.com';

const createApp = (allowedOrigin?: string) => {
  const original = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin !== undefined) {
    process.env.ALLOWED_ORIGIN = allowedOrigin;
  } else {
    delete process.env.ALLOWED_ORIGIN;
  }
  const app = express();
  setupMiddleware(app);
  app.get('/test', (_req, res) => res.json({ ok: true }));
  app.post('/test', (req, res) => res.json(req.body));
  // Restore so tests don't leak
  process.env.ALLOWED_ORIGIN = original;
  return app;
};

describe('Middleware Setup', () => {
  let savedOrigin: string | undefined;

  beforeEach(() => {
    savedOrigin = process.env.ALLOWED_ORIGIN;
  });

  afterEach(() => {
    if (savedOrigin === undefined) {
      delete process.env.ALLOWED_ORIGIN;
    } else {
      process.env.ALLOWED_ORIGIN = savedOrigin;
    }
  });

  it('should be a function', () => {
    expect(setupMiddleware).toBeDefined();
    expect(typeof setupMiddleware).toBe('function');
  });

  it('should not throw when called with valid Express app', () => {
    const app = express();
    process.env.ALLOWED_ORIGIN = ALLOWED;
    expect(() => setupMiddleware(app)).not.toThrow();
  });

  // ── CORS: allowed origin ─────────────────────────────────────────────────

  it('should allow requests from the configured ALLOWED_ORIGIN', async () => {
    const app = createApp(ALLOWED);

    const response = await request(app).get('/test').set('Origin', ALLOWED);

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED);
  });

  it('should reflect the allowed origin in a preflight response', async () => {
    const app = createApp(ALLOWED);

    const response = await request(app)
      .options('/test')
      .set('Origin', ALLOWED)
      .set('Access-Control-Request-Method', 'GET');

    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED);
  });

  // ── CORS: rejected origins ───────────────────────────────────────────────

  it('should reject requests from an unlisted origin', async () => {
    const app = createApp(ALLOWED);

    const response = await request(app).get('/test').set('Origin', 'https://evil.example.com');

    expect(response.status).toBe(500);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should allow requests with no Origin header (health checks / server-to-server)', async () => {
    const app = createApp(ALLOWED);

    // Supertest sends no Origin header by default
    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
  });

  it('should reject requests when ALLOWED_ORIGIN is not configured but an Origin is present', async () => {
    const app = createApp(undefined); // no env var

    const response = await request(app).get('/test').set('Origin', ALLOWED);

    expect(response.status).toBe(500);
  });

  // ── JSON body parsing ────────────────────────────────────────────────────

  it('should parse JSON request bodies', async () => {
    const app = createApp(ALLOWED);

    const response = await request(app)
      .post('/test')
      .set('Origin', ALLOWED)
      .set('Content-Type', 'application/json')
      .send({ foo: 'bar' });

    expect(response.body).toEqual({ foo: 'bar' });
  });
});
