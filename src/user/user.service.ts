import { Injectable, HttpException ,HttpStatus, ExecutionContext } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getToken } from 'src/utils/get-token';
import { password } from 'src/utils/password';
import { AuthService } from 'src/auth/auth.service';

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

      console.log(createUserDto.imageUser)
      
      const createUSer = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: passwordBcrypt,
          imageUser: createUserDto.imageUser ?? null 
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
        imageUser: true,
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
        imageUser: true,
        createdAt: true
      }
    })

    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    return user
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, req:any) {
    const user = await this.prisma.user.findFirst({
      where: {
          id: id,
          deletedAt: null
      }
  })
   
    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const informationUser = getToken(req)

    if(informationUser.id !== user.id) {
      return new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const passwordBcrypt = await password(updateUserDto.password)

      const userUpdate = await this.prisma.user.update({
        where: {
          id: id,
          deletedAt: null
        },
        data: {
          name: updateUserDto.name,
          email: user.email,
          password: passwordBcrypt,
          imageUser: updateUserDto.imageUser,
          updatedAt: new Date(Date.now())
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
    const informationUser = getToken(req)
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
          id: user.id
        }
      })

      return new HttpException('Deletado com sucesso!', HttpStatus.OK);
    } catch (error) {
      console.log(error)
      return new HttpException('Erro no servidor, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
