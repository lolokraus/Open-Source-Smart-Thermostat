require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const heartbeatRoutes = require('./routes/heartbeatRoutes');
const heatingRoutes = require('./routes/heatingRoutes');

const app = express();
const port = process.env.APPLICATION_PORT;

const corsOptions = {
  origin: 'your_domain_here', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Access-Control-Request-Method', 
    'Access-Control-Request-Headers'
  ], 
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use('/api', userRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/heartbeat', heartbeatRoutes);
app.use('/api/heating', heatingRoutes);

if (process.env.NODE_ENV === 'development') {
    const swaggerUi = require('swagger-ui-express');
    const swaggerJSDoc = require('swagger-jsdoc');

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Thermostat API',
          version: '1.0.0',
          description: 'Thermostat API',
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
        security: [{
          bearerAuth: []
        }]
      },
      apis: ['./routes/*.js'], 
    };

    const specs = swaggerJSDoc(options);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});