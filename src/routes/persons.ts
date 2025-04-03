// src/routes/persons.ts
import { FastifyInstance } from 'fastify';
import { $ref } from '../types';
import * as personRepository from '../repositories/personRepository';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: $ref('personSchema')
        }
      }
    }
  }, async () => {
    return personRepository.getPersons();
  });

  fastify.post('/', {
    schema: {
      body: $ref('personSchema'),
      response: {
        201: $ref('personSchema')
      }
    }
  }, async (request, reply) => {
    const personData = request.body as any;
    
    // Converter strings de data para objetos Date
    if (typeof personData.start_date === 'string') {
      personData.start_date = new Date(personData.start_date);
    }
    if (typeof personData.stop_date === 'string') {
      personData.stop_date = new Date(personData.stop_date);
    }
    
    const newPerson = await personRepository.createPerson(personData);
    
    return reply.code(201).send(newPerson);
  });

  fastify.get('/:id', {
    schema: {
      response: {
        200: $ref('personSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    const person = await personRepository.getPersonById(id);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    return person;
  });

  fastify.put('/:id', {
    schema: {
      body: $ref('personSchema'),
      response: {
        200: $ref('personSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const personData = request.body as any;
    
    // Converter strings de data para objetos Date
    if (typeof personData.start_date === 'string') {
      personData.start_date = new Date(personData.start_date);
    }
    if (typeof personData.stop_date === 'string') {
      personData.stop_date = new Date(personData.stop_date);
    }
    
    try {
      const updatedPerson = await personRepository.updatePerson(id, personData);
      return updatedPerson;
    } catch (error) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
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
      await personRepository.deletePerson(id);
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
  });
}