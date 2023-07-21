import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Inject, Req } from '@nestjs/common';

import { Request } from 'express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user/')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
    ) {}
 
  @Post('/create')
  createUser(@Body() createUserDto: CreateUserDto) {
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
