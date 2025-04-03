import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';


const app = Fastify({ logger: true });

// Swagger Configuration
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API-Rancheiro - Porta de controle remoto',
      description: 'API para controle remoto de portas e gerenciamento de usuários',
      version: '1.0.0',
    },
  },
});

app.register(fastifySwaggerUi, { routePrefix: '/docs' });

// Schema Definitions
const authSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const userInfoSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3),
  fullName: z.string(),
  email: z.string().email(),
  role: z.string(),
});

const scheduleSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  daysOfWeek: z.array(z.string()),
  userId: z.number(),
});

// Building JSON schemas
const { schemas, $ref } = buildJsonSchemas({
  authSchema,
  userInfoSchema,
  scheduleSchema,
});

// Adding schemas to Fastify
for (const schema of schemas) {
  app.addSchema(schema);
}



// Start the server
app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('Server running at http://localhost:3000');
});