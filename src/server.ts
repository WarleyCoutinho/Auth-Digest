import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import axios from 'axios';

const app = Fastify({ logger: true });

// Configuração do Swagger
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API com Autenticação Digest',
      description: 'Documentação da API utilizando Fastify, Zod e Swagger',
      version: '1.0.0',
    },
  },
});

// Configuração do Swagger UI
app.register(fastifySwaggerUi, { routePrefix: '/docs' });

// Definição do esquema de autenticação
const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Exportando os esquemas
const { schemas: authSchemas, $ref } = buildJsonSchemas({ authSchema });

// Adicionando os esquemas ao Fastify
for (const schema of authSchemas) {
  app.addSchema(schema);
}

// Função para controlar a porta
async function controlDoor(username: string, password: string): Promise<any> {
  const command = 'open'; 
  const xmlBody = `<RemoteControlDoor><cmd>${command}</cmd></RemoteControlDoor>`;
  const ip = 'http://10.10.1.214';
  const doorId = '1';

  const authToken = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await axios.put(
      `${ip}/ISAPI/AccessControl/RemoteControl/door/${doorId}`,
      xmlBody,
      {
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error; // Propaga o erro para ser tratado na rota
  }
}

// Rota para controle de porta
app.post('/door-control', {
  schema: {
    body: $ref('authSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, systemResponse: { type: 'string' } } },
      401: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string; };

  if (username === 'admin' && password === 'Cafe@569458') {
    const command = 'open';
    const doorId = '1';

    try {
      const systemResponse = await controlDoor( username, password);
      return {
        success: true,
        message: `Door ${doorId} command ${command} executed successfully`,
        systemResponse,
      };
    } catch (error: any) { // Definindo o tipo de erro como 'any'
      if (error.response) {
        // O servidor respondeu com um código de status que não está na faixa de 2xx
        app.log.error('Erro na requisição:', error.response.data);
        return reply.status(error.response.status).send({ error: error.response.data });
      } else {
        // Algum erro ocorreu ao configurar a requisição
        app.log.error('Erro ao fazer a requisição:', error.message);
        return reply.status(500).send({ error: 'Erro interno do servidor' });
      }
    }
  } else {
    return reply.status(401).send({ error: 'Credenciais inválidas' });
  }
});

// Iniciar o servidor
app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('Servidor rodando em http://localhost:3000');
});