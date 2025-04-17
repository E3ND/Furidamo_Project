import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';

import { Request } from 'express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { uploadFiles } from 'src/utils/uploadFiles';
import { checkTypeFileImage } from 'src/utils/check-type-file';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
    ) {}

  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    return this.userService.createUser(createUserDto);
  }

  @Post('/login')
  login(@Body() loginUserDto: loginUserDto) {
    return this.authService.signIn(loginUserDto.email, loginUserDto.password)
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageUser', maxCount: 50 },
    ])
  )
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request, @UploadedFiles() images: Express.Multer.File) {
    let imagesNames = null

    if(images["imageUser"]) {

      if(images["imageUser"] && images["imageUser"].length > 1) {
        throw new HttpException('Não pode pode ultrapassar o total de 1 imagens!', HttpStatus.BAD_REQUEST)
      }
  
      const typeFile = checkTypeFileImage(images["imageUser"])
   
      if(typeFile < images["imageUser"].length) {
        throw new HttpException('As imagens devem ser do tipo JPG, PNG ou JPEG', HttpStatus.BAD_REQUEST)
      }
  
      if(images["imageUser"] != null) {
        imagesNames = uploadFiles(images["imageUser"], req, 'user', 'images')
      }

    }
    
    return this.userService.updateUser(id, updateUserDto, req, imagesNames);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deleteUser(@Param('id') id: string, @Req() req: Request) {
    return this.userService.deleteUser(id, req);
  }
}
