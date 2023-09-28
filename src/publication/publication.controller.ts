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
import { checkTypeFileImage, checkTypeFileVideo } from '../utils/check-type-file';

//CRUD
@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageName', maxCount: 50 },
      { name: 'videoName', maxCount: 10 }
    ])
  )

  //CRUD
  async createPublication(
      @Body() createPublicationDto: CreatePublicationDto, 
      @Req() req: Request, 
      @UploadedFiles() images: Express.Multer.File,
      @UploadedFiles() video: Express.Multer.File,
      ) {

      let imagesNames = null
      let videoName = null

      if(images["imageName"]) {

      if(images["imageName"] && images["imageName"].length > 5) {
        throw new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
      }
  
      const typeFile = checkTypeFileImage(images["imageName"])
   
      if(typeFile < images["imageName"].length) {
        throw new HttpException('As imagens devem ser do tipo JPG, PNG ou JPEG', HttpStatus.BAD_REQUEST)
      }
  
      if(images["imageName"] != null) {
        imagesNames = uploadFiles(images["imageName"], req, 'publications', 'images')
      }
    }

    if(video["videoName"]) {
      if(video["videoName"] && video["videoName"].length > 1) {
        return new HttpException('Não pode pode ultrapassar o total de 1 vídeo!', HttpStatus.BAD_REQUEST)
      }

      const typeFile = checkTypeFileVideo(video["videoName"])

      if(typeFile < 1) {
        throw new HttpException('O vídeo deve ser do tipo mp3, mp4, WEBM ou MOV', HttpStatus.BAD_REQUEST)
      }

      if(video["videoName"] != null) {
        videoName = uploadFiles(images["videoName"], req, 'publications', 'video')
      }
    }

    return this.publicationService.createPublication(createPublicationDto, req, imagesNames, videoName);
  }

  @Get()
  findAllPublication() {
    return this.publicationService.findAllPublication();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOnePublication(@Param('id') id: string) {
    return await this.publicationService.findOnePublication(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageName', maxCount: 50 },
      { name: 'videoName', maxCount: 1},
    ])
  )
  updatePublication(
      @Param('id') id: string, 
      @Body() updatePublicationDto: UpdatePublicationDto, 
      @Req() req: Request, 
      @UploadedFiles() images: Express.Multer.File,
      ) {
    let imagesNames = null

    if(images["imageName"]) {
      if(images["imageName"] && images["imageName"].length > 5) {
        return new HttpException('Não pode pode ultrapassar o total de 5 imagens!', HttpStatus.BAD_REQUEST)
      }
      
      const typeFile = checkTypeFileImage(images["imageName"])
   
      if(typeFile < images["imageName"].length) {
        throw new HttpException('As imagens devem ser do tipo JPG, PNG ou JPEG', HttpStatus.BAD_REQUEST)
      }
  
      if(images["imageName"] != null) {
        imagesNames = uploadFiles(images["imageName"], req, 'publications', 'video')
      }
    }
    
    return this.publicationService.updatePublication(id, updatePublicationDto, req, imagesNames);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deletePublication(@Param('id') id: string, @Req() req: Request) {
    return this.publicationService.deletePublication(id, req);
  }

  //Like and Deslike
  @UseGuards(AuthGuard)
  @Patch('/like/:publicationId')
  likePublication(@Param('publicationId') publicationId: string, @Req() req: Request) {
    return this.publicationService.likePublication(publicationId, req)
  }

  @UseGuards(AuthGuard)
  @Patch('/deslike/:publicationId')
  deslikePublication(@Param('publicationId') publicationId: string, @Req() req: Request) {
    return this.publicationService.deslikePublication(publicationId, req)
  }

  @UseGuards(AuthGuard)
  @Get('/publications/:publicationId')
  getPublicationsComments(@Param('publicationId') publicationId: string) {
    return this.publicationService.getPublicationsComments(publicationId)
  }
}
