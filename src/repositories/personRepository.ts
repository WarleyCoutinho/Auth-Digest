import prisma from '../db/prisma';
import { Person } from '../types';

export const createPerson = async (data: Person) => {
  return prisma.person.create({
    data
  });
};

export const getPersonById = async (id: string) => {
  return prisma.person.findUnique({
    where: { id }
  });
};

export const getPersons = async () => {
  return prisma.person.findMany();
};

export const updatePerson = async (id: string, data: Partial<Person>) => {
  return prisma.person.update({
    where: { id },
    data
  });
};

export const deletePerson = async (id: string) => {
  return prisma.person.delete({
    where: { id }
  });
};