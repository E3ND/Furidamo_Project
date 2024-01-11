import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { NodeMailerService } from 'src/nodemailer/nodemailer.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthService, NodeMailerService],
})
export class UserModule {}
