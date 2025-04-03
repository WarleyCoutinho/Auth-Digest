// src/routes/schedules.ts
import { FastifyInstance } from 'fastify';
import { $ref } from '../types';
import * as scheduleRepository from '../repositories/scheduleRepository';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: $ref('scheduleSchema')
        }
      }
    }
  }, async () => {
    return scheduleRepository.getSchedules();
  });

  fastify.post('/', {
    schema: {
      body: $ref('scheduleSchema'),
      response: {
        201: $ref('scheduleSchema')
      }
    }
  }, async (request, reply) => {
    const scheduleData = request.body as any;
    
    const newSchedule = await scheduleRepository.createSchedule(scheduleData);
    
    return reply.code(201).send(newSchedule);
  });

  fastify.get('/:id', {
    schema: {
      response: {
        200: $ref('scheduleSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    const schedule = await scheduleRepository.getScheduleById(Number(id));
    if (!schedule) {
      return reply.code(404).send({ message: 'Agenda não encontrada' });
    }
    
    return schedule;
  });

  fastify.get('/user/:userId', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: $ref('scheduleSchema')
        }
      }
    }
  }, async (request, reply) => {
    const { userId } = request.params as any;
    
    return scheduleRepository.getSchedulesByUserId(Number(userId));
  });

  fastify.put('/:id', {
    schema: {
      body: $ref('scheduleSchema'),
      response: {
        200: $ref('scheduleSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const scheduleData = request.body as any;
    
    try {
      const updatedSchedule = await scheduleRepository.updateSchedule(Number(id), scheduleData);
      return updatedSchedule;
    } catch (error) {
      return reply.code(404).send({ message: 'Agenda não encontrada' });
    }
  });

  fastify.delete('/:id', {
    schema: {
      response: {
        204: {
          type: 'null'
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    try {
      await scheduleRepository.deleteSchedule(Number(id));
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ message: 'Agenda não encontrada' });
    }
  });
}