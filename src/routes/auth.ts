// src/routes/auth.ts
import { FastifyInstance } from 'fastify';
import { $ref } from '../types';
import * as userRepository from '../repositories/userRepository';
import { compareSync, hashSync } from 'bcrypt';
import { sign } from 'jsonwebtoken';

export default async function (fastify: FastifyInstance) {
  fastify.post('/login', {
    schema: {
      body: $ref('authSchema'),
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body as any;
    
    const user = await userRepository.getUserByUsername(username);
    if (!user) {
      return reply.code(401).send({ message: 'Credenciais inválidas' });
    }

    const passwordMatch = compareSync(password, user.password);
    if (!passwordMatch) {
      return reply.code(401).send({ message: 'Credenciais inválidas' });
    }

    const token = sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    return { token };
  });

  fastify.post('/register', {
    schema: {
      body: $ref('userInfoSchema'),
      response: {
        201: $ref('userInfoSchema')
      }
    }
  }, async (request, reply) => {
    const userData = request.body as any;
    
    // Hash password
    userData.password = hashSync(userData.password, 10);
    
    const newUser = await userRepository.createUser(userData);
    
    return reply.code(201).send(newUser);
  });
}