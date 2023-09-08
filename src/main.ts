import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const port = process.env.PORT || 3000;

  app
  .listen(parseInt(port.toString(), 10), "0.0.0.0")
  .then(() => {
    Logger.log(`API Listen on http://localhost:${port}`);
  })

  .catch((error: any) => Logger.error(error));
  await app.listen(3000);
}
bootstrap();
