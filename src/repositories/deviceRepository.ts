// src/repositories/deviceRepository.ts
import prisma from '../db/prisma';
import { Device } from '../types';

export const createDevice = async (data: Omit<Device, 'id'>) => {
  return prisma.device.create({
    data
  });
};

export const getDeviceById = async (id: number) => {
  return prisma.device.findUnique({
    where: { id }
  });
};

export const getDeviceByName = async (name: string) => {
  return prisma.device.findUnique({
    where: { name }
  });
};

export const getDevicesByIds = async (ids: number[]) => {
  return prisma.device.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const getDevices = async () => {
  return prisma.device.findMany();
};

export const updateDevice = async (id: number, data: Partial<Device>) => {
  return prisma.device.update({
    where: { id },
    data
  });
};

export const deleteDevice = async (id: number) => {
  return prisma.device.delete({
    where: { id }
  });
};