// src/server.ts
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { schemas } from './types';

// Plugins
import authentication from './plugins/authentication';
import errorHandler from './plugins/errorHandler';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import deviceRoutes from './routes/devices';
import personRoutes from './routes/persons';
import scheduleRoutes from './routes/schedules';

const app = Fastify({ 
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

// Registrar plugins
app.register(cors);
app.register(helmet);
app.register(authentication);
app.register(errorHandler);

// Swagger/OpenAPI
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API-Rancheiro - Porta de controle remoto',
      description: 'API para controle remoto de portas e gerenciamento de usuários',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  }
});

app.register(fastifySwaggerUi, { 
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true,
});

// Registrando schemas
for (const schema of schemas) {
  app.addSchema(schema);
}

// Registrar rotas
app.register(authRoutes, { prefix: '/auth' });
app.register(userRoutes, { 
  prefix: '/users',
  preHandler: [app.authenticate]
});
app.register(deviceRoutes, { 
  prefix: '/devices',
  preHandler: [app.authenticate]
});
app.register(personRoutes, { 
  prefix: '/persons',
  preHandler: [app.authenticate]
});
app.register(scheduleRoutes, { 
  prefix: '/schedules',
  preHandler: [app.authenticate]
});

// Rota de saúde
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date() };
});

// Configuração para inicialização do servidor
const start = async () => {
  try {
    await app.listen({ 
      port: parseInt(process.env.PORT || '3000'), 
      host: process.env.HOST || '0.0.0.0' 
    });
    console.log(`Servidor rodando em ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Lidar com sinais de desligamento
process.on('SIGINT', async () => {
  await app.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.close();
  process.exit(0);
});

// Iniciar o servidor
start();