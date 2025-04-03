// src/routes/users.ts
import { FastifyInstance } from 'fastify';
import { $ref } from '../types';
import * as userRepository from '../repositories/userRepository';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: $ref('userInfoSchema')
        }
      }
    }
  }, async () => {
    return userRepository.getUsers();
  });

  fastify.get('/:id', {
    schema: {
      response: {
        200: $ref('userInfoSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    const user = await userRepository.getUserById(Number(id));
    if (!user) {
      return reply.code(404).send({ message: 'Usuário não encontrado' });
    }
    
    return user;
  });

  fastify.put('/:id', {
    schema: {
      body: $ref('userInfoSchema'),
      response: {
        200: $ref('userInfoSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const userData = request.body as any;
    
    try {
      const updatedUser = await userRepository.updateUser(Number(id), userData);
      return updatedUser;
    } catch (error) {
      return reply.code(404).send({ message: 'Usuário não encontrado' });
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
      await userRepository.deleteUser(Number(id));
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ message: 'Usuário não encontrado' });
    }
  });
}
