// src/repositories/scheduleRepository.ts
import prisma from '../db/prisma';
import { Schedule } from '../types';

export const createSchedule = async (data: Omit<Schedule, 'id'>) => {
  return prisma.schedule.create({
    data
  });
};

export const getScheduleById = async (id: number) => {
  return prisma.schedule.findUnique({
    where: { id }
  });
};

export const getSchedules = async () => {
  return prisma.schedule.findMany();
};

export const getSchedulesByUserId = async (userId: number) => {
  return prisma.schedule.findMany({
    where: { userId }
  });
};

export const updateSchedule = async (id: number, data: Partial<Schedule>) => {
  return prisma.schedule.update({
    where: { id },
    data
  });
};

export const deleteSchedule = async (id: number) => {
  return prisma.schedule.delete({
    where: { id }
  });
};