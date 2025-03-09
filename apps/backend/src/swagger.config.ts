import { Options } from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Credence Authentication API',
      version: '1.0.0',
      description: 'Api for authentication',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
  },
  apis: [path.join(__dirname, "./modules/*/*.routes.ts")], // Path to the API routes (adjust as needed)
};

export default swaggerOptions;
