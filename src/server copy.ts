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
  // command: z.string().optional(), // Adicionando o campo command como opcional
  // doorId: z.string().min(1, 'Door ID is required'), // Adicionando o campo doorId
  // ip: z.string().min(7, 'IP address is required'), // Adicionando o campo IP
});

// Exportando os esquemas
const { schemas: authSchemas, $ref } = buildJsonSchemas({ authSchema });

// Adicionando os esquemas ao Fastify
for (const schema of authSchemas) {
  app.addSchema(schema);
}

// Rota para controle de porta
app.post('/door-control', {
  schema: {
    body: $ref('authSchema'), // Adicionando o esquema de autenticação
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, systemResponse: { type: 'string' } } },
      401: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { username, password} = request.body as {
    username: string;
    password: string;
 
  };

  if (username === 'admin' && password === 'Cafe@569458') {
    const command ='open'
    const xmlBody = `<RemoteControlDoor><cmd>${command}</cmd></RemoteControlDoor>`; // XML body for the request
    const ip = 'http://10.10.1.214'; 
    const doorId = '1';
    //const authToken = 'nswdjkfhewjhfcverdjfc; 
    try {
      const response = await axios.put(
        `${ip}/ISAPI/AccessControl/RemoteControl/door/${doorId}`,
        xmlBody,
        {
          headers: {
            'Content-Type': 'application/xml',
            // Se você precisar de um token de autorização, adicione-o aqui
             //'Authorization': `Bearer ${authToken}`,
          },
        }
      );
    
      console.log('Resposta:', response.data);
      return {
        success: true,
        message: `Door ${doorId} command ${command} executed successfully`,
        systemResponse: response.data
      };
    } 
    catch (error) {
      app.log.error(error);
      reply.status(500).send({ error: 'Erro ao controlar a porta' });
    }
  } else {
    reply.status(401).send({ error: 'Credenciais inválidas' });
  }
});

// Iniciar o servidor
app.listen({ port: 3000 }, () => {
  console.log('Servidor rodando em http://localhost:3000');
});