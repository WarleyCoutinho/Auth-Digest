// src/repositories/userRepository.ts
import prisma from '../db/prisma';
import { UserInfo } from '../types';

export const createUser = async (data: Omit<UserInfo, 'id'>) => {
  return prisma.user.create({
    data
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id }
  });
};

export const getUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: { username }
  });
};

export const getUsers = async () => {
  return prisma.user.findMany();
};

export const updateUser = async (id: number, data: Partial<UserInfo>) => {
  return prisma.user.update({
    where: { id },
    data
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id }
  });
};