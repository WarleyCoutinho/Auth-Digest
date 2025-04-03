// src/routes/devices.ts
import { FastifyInstance } from 'fastify';
import { $ref } from '../types';
import * as deviceRepository from '../repositories/deviceRepository';
import * as personRepository from '../repositories/personRepository';
import deviceService from '../services/device/deviceService';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'array',
          items: $ref('deviceSchema')
        }
      }
    }
  }, async () => {
    return deviceRepository.getDevices();
  });

  fastify.post('/', {
    schema: {
      body: $ref('deviceSchema'),
      response: {
        201: $ref('deviceSchema')
      }
    }
  }, async (request, reply) => {
    const deviceData = request.body as any;
    
    const newDevice = await deviceRepository.createDevice(deviceData);
    
    return reply.code(201).send(newDevice);
  });

  fastify.get('/:id', {
    schema: {
      response: {
        200: $ref('deviceSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    const device = await deviceRepository.getDeviceById(Number(id));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    return device;
  });

  fastify.put('/:id', {
    schema: {
      body: $ref('deviceSchema'),
      response: {
        200: $ref('deviceSchema')
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as any;
    const deviceData = request.body as any;
    
    try {
      const updatedDevice = await deviceRepository.updateDevice(Number(id), deviceData);
      return updatedDevice;
    } catch (error) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
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
      await deviceRepository.deleteDevice(Number(id));
      return reply.code(204).send();
    } catch (error) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
  });

  // Rota para reiniciar dispositivos
  fastify.post('/reboot', {
    schema: {
      body: {
        type: 'object',
        properties: {
          deviceIds: {
            type: 'array',
            items: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { deviceIds } = request.body as any;
    
    const devices = await deviceRepository.getDevicesByIds(deviceIds);
    
    await deviceService.rebootDevice(devices);
    
    return { success: true };
  });

  // Rotas para gerenciar pessoas nos dispositivos
  fastify.post('/:deviceId/persons/:personId', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.sendToDevice(device, person);
    
    return { success: !!result, result };
  });

  fastify.put('/:deviceId/persons/:personId', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.updatePerson(device, person);
    
    return { success: !!result, result };
  });

  fastify.delete('/:deviceId/persons/:personId', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.deletePerson(device, person);
    
    return { success: !!result, result };
  });

  // Rotas para gerenciar imagens de pessoas nos dispositivos
  fastify.get('/:deviceId/persons/:personId/image', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    const { path } = request.query as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.getImage(device, person, path || './images/');
    
    return { success: result };
  });

  fastify.post('/:deviceId/persons/:personId/image', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    const { urlOrigem } = request.body as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.setImage(device, person, urlOrigem);
    
    return { success: !!result, result };
  });

  fastify.delete('/:deviceId/persons/:personId/face', async (request, reply) => {
    const { deviceId, personId } = request.params as any;
    
    const device = await deviceRepository.getDeviceById(Number(deviceId));
    if (!device) {
      return reply.code(404).send({ message: 'Dispositivo não encontrado' });
    }
    
    const person = await personRepository.getPersonById(personId);
    if (!person) {
      return reply.code(404).send({ message: 'Pessoa não encontrada' });
    }
    
    const result = await deviceService.deleteFace(device, person);
    
    return { success: !!result, result };
  });
}