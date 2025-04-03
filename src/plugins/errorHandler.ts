// src/plugins/errorHandler.ts
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (fastify: FastifyInstance) => {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    // Log error
    fastify.log.error(error);
    
    // Prisma client errors
    if (error.code && error.code.startsWith('P')) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Erro de validação no banco de dados'
      });
    }
    
    // Zod validation errors
    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Erro de validação',
        details: error.validation
      });
    }
    
    // Default error
    reply.code(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || 'Error',
      message: error.message || 'Erro interno no servidor'
    });
  });
});