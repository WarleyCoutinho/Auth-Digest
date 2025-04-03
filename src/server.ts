import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';
import axios from 'axios';
import crypto from 'crypto';

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

// Helper functions
async function createDigestAuth(username: string, password: string, url: string, method: string): Promise<string> {
  const realm = "testrealm@example.com";
  const nonce = crypto.randomBytes(16).toString('hex');
  const algorithm = "MD5";
  const qop = "auth-int";
  
  const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${url}`).digest('hex');
  const nonceCount = "00000001";
  const cnonce = crypto.randomBytes(8).toString('hex');
  
  const response = crypto.createHash('md5')
    .update(`${ha1}:${nonce}:${nonceCount}:${cnonce}:${qop}:${ha2}`)
    .digest('hex');
  
  return `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${url}", algorithm=${algorithm}, qop=${qop}, nc=${nonceCount}, cnonce="${cnonce}", response="${response}"`;
}

async function controlDoor(username: string, password: string, command: string = 'open'): Promise<any> {
  const xmlBody = `<RemoteControlDoor><cmd>${command}</cmd></RemoteControlDoor>`;
  const ip = 'http://10.10.1.214';
  const doorId = '1';
  const url = `/ISAPI/AccessControl/RemoteControl/door/${doorId}`;
  
  try {
    // Using Digest Authentication as shown in the Postman screenshots
    const digestAuth = await createDigestAuth(username, password, url, 'PUT');
    
    const response = await axios.put(
      `${ip}${url}`,
      xmlBody,
      {
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': digestAuth,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Routes based on Postman collection
// 1. Remote Door Control
app.put('/door-control', {
  schema: {
    body: $ref('authSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, response: { type: 'string' } } },
      401: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string; };

  try {
    const response = await controlDoor(username, password);
    return {
      success: true,
      message: 'Door command executed successfully',
      response,
    };
  } catch (error: any) {
    if (error.response) {
      app.log.error('Request error:', error.response.data);
      return reply.status(error.response.status).send({ error: error.response.data });
    } else {
      app.log.error('Error making request:', error.message);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
});

// 2. Reset Device
app.put('/reset-device', {
  schema: {
    body: $ref('authSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
      401: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { username, password } = request.body as { username: string; password: string; };
  const ip = 'http://10.10.1.214';
  
  try {
    const url = '/ISAPI/System/reboot';
    const digestAuth = await createDigestAuth(username, password, url, 'PUT');
    
    await axios.put(`${ip}${url}`, null, {
      headers: {
        'Authorization': digestAuth,
      },
    });
    
    return {
      success: true,
      message: 'Device reset initiated successfully',
    };
  } catch (error: any) {
    if (error.response) {
      return reply.status(error.response.status).send({ error: error.response.data });
    } else {
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
});

// 3. Calendar Module API endpoints
// 3.1 Create Schedule
app.put('/create-schedule', {
  schema: {
    body: $ref('scheduleSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, scheduleId: { type: 'number' } } },
      400: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const scheduleData = request.body as z.infer<typeof scheduleSchema>;
  
  try {
    // Mock implementation - in a real app, you would store this in a database
    const scheduleId = Math.floor(Math.random() * 1000);
    
    return {
      success: true,
      scheduleId,
      message: 'Schedule created successfully'
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to create schedule' });
  }
});

// 3.2 Get Schedule
app.get('/get-schedule', {
  schema: {
    querystring: z.object({
      id: z.string(),
    }),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, schedule: $ref('scheduleSchema') } },
      404: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { id } = request.query as { id: string };
  
  try {
    // Mock implementation
    const mockSchedule = {
      id: parseInt(id),
      name: 'Weekly Access',
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      userId: 1,
    };
    
    return {
      success: true,
      schedule: mockSchedule
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to retrieve schedule' });
  }
});

// 4. User Information API endpoints
// 4.1 User Search
app.post('/user-search', {
  schema: {
    body: z.object({
      searchTerm: z.string(),
    }),
    response: {
      200: { type: 'object', properties: { 
        success: { type: 'boolean' }, 
        users: { type: 'array', items: $ref('userInfoSchema') } 
      }},
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { searchTerm } = request.body as { searchTerm: string };
  
  try {
    // Mock implementation
    const mockUsers = [
      {
        id: 1,
        username: 'user1',
        fullName: 'User One',
        email: 'user1@example.com',
        role: 'Admin'
      },
      {
        id: 2,
        username: 'user2',
        fullName: 'User Two',
        email: 'user2@example.com',
        role: 'User'
      }
    ].filter(user => 
      user.username.includes(searchTerm) || 
      user.fullName.includes(searchTerm) || 
      user.email.includes(searchTerm)
    );
    
    return {
      success: true,
      users: mockUsers
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to search users' });
  }
});

// 4.2 Update User Information
app.put('/update-user', {
  schema: {
    body: $ref('userInfoSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } },
      404: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const userData = request.body as z.infer<typeof userInfoSchema>;
  
  try {
    // Mock implementation
    if (!userData.id) {
      return reply.status(400).send({ error: 'User ID is required' });
    }
    
    return {
      success: true,
      message: 'User information updated successfully'
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to update user information' });
  }
});

// 5. Weekly Schedule API endpoints
// 5.1 Add Weekly Schedule
app.put('/add-weekly-schedule', {
  schema: {
    body: $ref('scheduleSchema'),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, scheduleId: { type: 'number' } } },
      400: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const scheduleData = request.body as z.infer<typeof scheduleSchema>;
  
  try {
    // Mock implementation
    const scheduleId = Math.floor(Math.random() * 1000);
    
    return {
      success: true,
      scheduleId,
      message: 'Weekly schedule added successfully'
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to add weekly schedule' });
  }
});

// 5.2 Get Weekly Schedule
app.get('/get-weekly-schedule', {
  schema: {
    querystring: z.object({
      id: z.string(),
    }),
    response: {
      200: { type: 'object', properties: { success: { type: 'boolean' }, schedule: $ref('scheduleSchema') } },
      404: { type: 'object', properties: { error: { type: 'string' } } },
      500: { type: 'object', properties: { error: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  const { id } = request.query as { id: string };
  
  try {
    // Mock implementation
    const mockSchedule = {
      id: parseInt(id),
      name: 'Weekly Schedule',
      startTime: '08:00',
      endTime: '18:00',
      daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
      userId: 1,
    };
    
    return {
      success: true,
      schedule: mockSchedule
    };
  } catch (error: any) {
    return reply.status(500).send({ error: 'Failed to retrieve weekly schedule' });
  }
});

// Start the server
app.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('Server running at http://localhost:3000');
});