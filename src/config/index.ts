// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpiry: process.env.JWT_EXPIRY || '8h',
  environment: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL,
  imageStoragePath: process.env.IMAGE_STORAGE_PATH || './images/'
};