import { Express } from 'express';
import cors from 'cors';
import express from 'express';

/**
 * Configure common middleware for the application
 */
export const setupMiddleware = (app: Express): void => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server requests (no Origin header) only in non-production
        if (!origin) {
          if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
          }
          return callback(new Error('CORS: missing Origin header'));
        }

        if (!allowedOrigin) {
          return callback(new Error('CORS: ALLOWED_ORIGIN is not configured'));
        }

        if (origin === allowedOrigin) {
          return callback(null, true);
        }

        return callback(new Error(`CORS: origin '${origin}' is not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json());
};
