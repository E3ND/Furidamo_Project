import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PublicationController],
  providers: [PublicationService, PrismaService, AuthService]
})
export class PublicationModule {}
