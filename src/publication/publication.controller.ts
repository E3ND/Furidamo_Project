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
import { uploadFiles } from 'src/utils/uploadFiles';
import { checkTypeFile } from '../utils/check-type-file';

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
  async createPublication(@Body() createPublicationDto: CreatePublicationDto, @Req() req: Request, @UploadedFiles() images: Express.Multer.File) {
    let imagesNames = null
    if(images["imageName"]) {
      if(images["imageName"] && images["imageName"].length > 5) {
        throw new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
      }
  
      const typeFile = checkTypeFile(images["imageName"])
   
      if(typeFile < images["imageName"].length) {
        throw new HttpException('As imagens devem ser do tipo JPG, PNG ou JPEG', HttpStatus.BAD_REQUEST)
      }
  
      if(images["imageName"] != null) {
        imagesNames = uploadFiles(images["imageName"], req, 'publications')
      }
    }

    return this.publicationService.createPublication(createPublicationDto, req, imagesNames);
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
    let imagesNames = null

    if(images["imageName"]) {
      if(images["imageName"] && images["imageName"].length > 5) {
        return new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
      }
      
      const typeFile = checkTypeFile(images["imageName"])
   
      if(typeFile < images["imageName"].length) {
        throw new HttpException('As imagens devem ser do tipo JPG, PNG ou JPEG', HttpStatus.BAD_REQUEST)
      }
  
      if(images["imageName"] != null) {
        imagesNames = uploadFiles(images["imageName"], req, 'publications')
      }
    }
    
    return this.publicationService.updatePublication(id, updatePublicationDto, req, imagesNames);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deletePublication(@Param('id') id: string, @Req() req: Request) {
    return this.publicationService.deletePublication(id, req);
  }
}
