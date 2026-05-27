import { Express } from 'express';
import cors from 'cors';
import express from 'express';

/**
 * Configure common middleware for the application
 */
export const setupMiddleware = (app: Express): void => {
  app.use(cors());
  app.use(express.json());
};
