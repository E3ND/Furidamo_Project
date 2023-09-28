import { Module, MiddlewareConsumer  } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PublicationModule } from './publication/publication.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    UserModule, 
    PrismaModule, 
    AuthModule,
    ConfigModule.forRoot(),
    PublicationModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
