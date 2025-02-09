import {
  DocumentBuilder,
  OpenAPIObject,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('5S CAMERA MEDIA API')
  .setDescription('5S CAMERA MEDIA API documentation')
  .setVersion('1.0')
  .addSecurity('apiKey', {
    type: 'apiKey',
    name: 'Authorization',
    in: 'header',
    description: 'Input your JWT token without Bearer prefix',
  })
  .build() as OpenAPIObject;

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
