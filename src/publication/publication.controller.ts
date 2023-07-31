import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { AuthGuard } from 'src/auth/auth.guard';

import { Request } from 'express';

@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  createPublication(@Body() createPublicationDto: CreatePublicationDto, @Req() req: Request) {
    return this.publicationService.createPublication(createPublicationDto, req);
  }

  @Get()
  findAllPublication() {
    return this.publicationService.findAllPublication();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOnePublication(@Param('id') id: string) {
    return this.publicationService.findOnePublication(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  updatePublication(@Param('id') id: string, @Body() updatePublicationDto: UpdatePublicationDto, @Req() req: Request) {
    return this.publicationService.updatePublication(id, updatePublicationDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deletePublication(@Param('id') id: string, @Req() req: Request) {
    return this.publicationService.deletePublication(id, req);
  }
}
