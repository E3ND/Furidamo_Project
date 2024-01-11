import { Module } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { PublicationController } from './publication.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodeMailerService } from 'src/nodemailer/nodemailer.service';

@Module({
  controllers: [PublicationController],
  providers: [PublicationService, PrismaService, AuthService, NodeMailerService]
})
export class PublicationModule {}
