import { Injectable, HttpException ,HttpStatus, ExecutionContext } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getToken } from 'src/utils/get-token';
import { password } from 'src/utils/password';
import { AuthService } from 'src/auth/auth.service';

import * as fs from 'fs';
import { IGetToken } from 'src/auth';

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ){}

  async createUser(createUserDto: CreateUserDto) {
    //Se eu fazer um softdelete em um usuario e logo depois tentar crir o mesmo usuario, ele vai dar erro,
    //O que se deve fazer neste caso?
    const user = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        deletedAt: null
      } 
    })

    if(user) {
      return new HttpException('Usuário já existente!', HttpStatus.CONFLICT);
    }

    try {
      const passwordBcrypt = await password(createUserDto.password)

      const createUSer = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: passwordBcrypt,
          imageName: [] 
        }
      })

      const createUserToken = await this.authService.signIn(createUSer.email, createUserDto.password)
      return createUserToken

    } catch (error) {
      console.log(error)
      return new HttpException('Erro no servidor, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        imageName: true,
        createdAt: true,
        updatedAt: true,
      }
    })
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        imageName: true,
        createdAt: true
      }
    })

    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, req:any, imagesNames: string) {
    const user = await this.prisma.user.findFirst({
      where: {
          id: id,
          deletedAt: null
      }
  })
   
    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const informationUser:IGetToken.Params = getToken(req)

    if(informationUser.id !== user.id) {
      return new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    } 

    try {
      let jsonImageNames: any = {
        name: []
      }
  
      if (imagesNames != null) {
  
        for (let key of imagesNames) {
          jsonImageNames.name.push(key.toString())
        }
      } else {
        jsonImageNames.name = ['null']
      }

      const passwordBcrypt = await password(updateUserDto.password)

      if(jsonImageNames.name[0] === 'null') {
        jsonImageNames.name = user.imageName
      } else {
        user.imageName.map(imageName => {
          fs.unlink(`./src/public/images/${user.id}/user/${imageName}`, (err) => {
            if (err) {
              console.error('Erro ao deletar o arquivo:', err);
            }
          });
        })
      }

      const userUpdate = await this.prisma.user.update({
        where: {
          id: id,
          deletedAt: null
        },
        data: {
          name: updateUserDto.name,
          email: user.email,
          password: passwordBcrypt,
          updatedAt: new Date(Date.now()),
          imageName: jsonImageNames.name
        }
      })

      userUpdate.password = null

      return userUpdate
    } catch (error) {
      console.log(error)
      return new HttpException('Erro no servidor, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(id: string, req:any) {
    const informationUser:IGetToken.Params = getToken(req)
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
        deletedAt: null,
      }
    })

    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    if(informationUser.id !== user.id) {
      return new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    this.prisma.$use(async(params, next) => {
      if(params.model == 'User') {
        if(params.action == 'delete') {

          params.action = 'update'
          params.args['data'] = {deletedAt: new Date(Date.now()) }
        }
      }
      return next(params)
    })

    try {
      await this.prisma.user.delete({
        where: {
          id: user.id,
          deletedAt: null
        }
      })

      return new HttpException('Deletado com sucesso!', HttpStatus.OK);
    } catch (error) {
      console.log(error)
      return new HttpException('Erro no servidor, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
