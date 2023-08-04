import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

import { Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { uploadFiles } from 'src/common/utils/uploadFiles';

@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageName', maxCount: 50 },
    ])
  )
  async createPublication(@Body() createPublicationDto: any, @Req() req: Request, @UploadedFiles() images: Express.Multer.File) {
    if(images["imageName"] && images["imageName"].length > 5) {
      return new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
  }

    if(images["imageName"] != null) {
      createPublicationDto.imageName = uploadFiles(images["imageName"], req)
    }

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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageName', maxCount: 50 },
    ])
  )
  updatePublication(@Param('id') id: string, @Body() updatePublicationDto: UpdatePublicationDto, @Req() req: Request, @UploadedFiles() images: Express.Multer.File) {
    if(images["imageName"] && images["imageName"].length > 5) {
      return new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
    }
    
    return this.publicationService.updatePublication(id, updatePublicationDto, req, images["imageName"]);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deletePublication(@Param('id') id: string, @Req() req: Request) {
    return this.publicationService.deletePublication(id, req);
  }
}
