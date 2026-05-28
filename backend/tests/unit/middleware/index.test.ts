import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import { setupMiddleware } from '../../../src/middleware';

describe('Middleware Setup', () => {
  it('should be a function', () => {
    expect(setupMiddleware).toBeDefined();
    expect(typeof setupMiddleware).toBe('function');
  });

  it('should configure middleware on the app', () => {
    const app = express();
    const useSpy = vi.spyOn(app, 'use');

    setupMiddleware(app);

    expect(useSpy).toHaveBeenCalled();
    expect(useSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('should not throw when called with valid Express app', () => {
    const app = express();
    expect(() => setupMiddleware(app)).not.toThrow();
  });

  it('should enable CORS middleware', () => {
    const app = express();
    const useSpy = vi.spyOn(app, 'use');

    setupMiddleware(app);

    // Check that middleware was registered (CORS and JSON parser)
    expect(useSpy).toHaveBeenCalledTimes(2);
    expect(useSpy.mock.calls[0][0]).toBeDefined();
    expect(useSpy.mock.calls[1][0]).toBeDefined();
  });

  it('should enable JSON body parser middleware', () => {
    const app = express();
    const useSpy = vi.spyOn(app, 'use');

    setupMiddleware(app);

    // Verify that use was called (once for CORS, once for JSON)
    expect(useSpy).toHaveBeenCalled();
    expect(useSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
