import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Inject, Req, UseInterceptors, UploadedFile, HttpException, HttpStatus, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

import { Request } from 'express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('user/')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
    ) {}
 
  @Post('/create')
  @UseInterceptors(
    FileInterceptor('imageUser', {
      storage: diskStorage({
        destination: './src/public/images/image-users', 
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new HttpException('Apenas imagens JPG, JPEG, e PNG são permitidas!', HttpStatus.BAD_REQUEST), false)
        }
        cb(null, true);
      },
    }),
  )
  async createUser(@Body() createUserDto: CreateUserDto, @UploadedFile() imageUser: Express.Multer.File) {
    if(imageUser && imageUser.size > 3 * 1024 * 1024) {
      fs.unlink(`src/public/images/image-users/${imageUser.filename}`, (error) => {
        if(error) {
          console.log(error+" Ao tentar excluir => "+imageUser.filename)
          return new HttpException('Erro no servidor, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR)
        }
      })
      return new HttpException('Apenas imagens de até 3mb são permitidas!', HttpStatus.BAD_REQUEST)
    }
    
    createUserDto.imageUser = imageUser.fieldname
    return this.userService.createUser(createUserDto);
  }

  @Get('/login')
  login(@Body() loginUserDto: loginUserDto) {
    return this.authService.signIn(loginUserDto.email, loginUserDto.password)
  }

  @UseGuards(AuthGuard)
  @Get('/all')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.userService.updateUser(id, updateUserDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  deleteUser(@Param('id') id: string, @Req() req: Request) {
    return this.userService.deleteUser(id, req);
  }
}
