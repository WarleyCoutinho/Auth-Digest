// src/plugins/authentication.ts
import { FastifyInstance, FastifyRequest } from 'fastify';
import { verify } from 'jsonwebtoken';
import fp from 'fastify-plugin';

interface User {
  id: number;
  username: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: any) => {
    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        return reply.code(401).send({ message: 'Não autorizado' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return reply.code(401).send({ message: 'Não autorizado' });
      }
      
      const decoded = verify(token, process.env.JWT_SECRET || 'secret') as User;
      
      request.user = decoded;
    } catch (err) {
      return reply.code(401).send({ message: 'Não autorizado' });
    }
  });
  
  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: any) => {
    if (!request.user) {
      return reply.code(401).send({ message: 'Não autorizado' });
    }
    
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ message: 'Acesso proibido' });
    }
  });
});
