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
        // No Origin header means same-origin or server-to-server (e.g. health checks).
        // CORS does not apply to these requests — always allow them.
        if (!origin) {
          return callback(null, true);
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
