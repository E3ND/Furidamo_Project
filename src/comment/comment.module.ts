import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  controllers: [CommentController],
  providers: [CommentService, PrismaService]
})
export class CommentModule {}
