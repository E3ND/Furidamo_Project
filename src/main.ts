import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 4000;

  app.enableCors({
    origin: [process.env.FRONT_END_URL], 
    methods: 'GET,POST,PUT,DELETE', 
    allowedHeaders: 'Content-Type, Authorization', 
    credentials: true, 
  });

  app
  .listen(parseInt(port.toString(), 10), "0.0.0.0")
  .then(() => {
    Logger.log(`API Listen on http://localhost:${port}`);
  })

  .catch((error: any) => Logger.error(error));
  await app.listen(4000);
}
bootstrap();
