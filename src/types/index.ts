// src/types/index.ts
import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

// Schema Definitions
export const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const userInfoSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

export const scheduleSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  daysOfWeek: z.array(z.string()),
  userId: z.number(),
});

export const deviceSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  ip: z.string(),
  username: z.string(),
  password: z.string(),
  event: z.string().optional(),
  lastData: z.any().optional(),
});

export const personSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  gender: z.string(),
  start_date: z.date(),
  stop_date: z.date(),
});

// Building JSON schemas
export const { schemas, $ref } = buildJsonSchemas({
  authSchema,
  userInfoSchema,
  scheduleSchema,
  deviceSchema,
  personSchema,
});

// Types derived from schemas
export type Auth = z.infer<typeof authSchema>;
export type UserInfo = z.infer<typeof userInfoSchema>;
export type Schedule = z.infer<typeof scheduleSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type Person = z.infer<typeof personSchema>;