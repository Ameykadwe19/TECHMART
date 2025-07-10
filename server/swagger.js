const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopping API Docs',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
      },
    ],
  },
  apis: ['./routes/*.js'], // path to route files
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
