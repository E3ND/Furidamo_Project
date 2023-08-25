import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getToken } from 'src/utils/get-token';
import * as fs from 'fs';
import { uploadFiles } from 'src/utils/uploadFiles';

@Injectable()
export class PublicationService {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) { }

  async createPublication(createPublicationDto: CreatePublicationDto, req: any, imagesNames: string) {
    try {
      const informationUser = getToken(req)
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

      return await this.prisma.publication.create({
        data: {
          title: createPublicationDto.title,
          text: createPublicationDto.text,
          like: ['null'],
          deslike: ['null'],
          edited: false,
          imageName: jsonImageNames.name,
          user: {
            connect: {
              id: informationUser.id,
            }
          }
        }
      })

    } catch (error) {
      console.log(error)
      return new HttpException('Erro ao criar um post!', HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }

  async findAllPublication() {
    return await this.prisma.publication.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async findOnePublication(id: string) {
    return await this.prisma.publication.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageName: true,
            createdAt: true
          }
        },
        comments: true,
      }
    })
  }

  async updatePublication(id: string, updatePublicationDto: UpdatePublicationDto, req: any, imageFile: any) {
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: id,
      }
    })

    if (!publication) {
      return new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND);
    }

    const informationUser = getToken(req)

    let jsonImageNames: any = {
      name: []
    }

    if (imageFile != null) {

      for (let key of imageFile) {
        jsonImageNames.name.push(key.toString())
      }
    } else {
      jsonImageNames.name = ['null']
    }

    if (publication.userId !== informationUser.id) {
      return new HttpException('Acão negada!', HttpStatus.UNAUTHORIZED);
    }

    if(jsonImageNames.name[0] === 'null') {
      jsonImageNames.name = publication.imageName
    } else {
      publication.imageName.map(imageName => {
        fs.unlink(`./src/public/images/${informationUser.id}/publications/${imageName}`, (err) => {
          if (err) {
            console.error('Erro ao deletar o arquivo:', err);
          }
        });
      })
    }

    try {
      return await this.prisma.publication.update({
        where: {
          id: publication.id,
        },

        data: {
          title: updatePublicationDto.title,
          text: updatePublicationDto.text,
          like: ['null'],
          deslike: ['null'],
          edited: true,
          imageName: jsonImageNames.name,
          updatedAt: new Date(Date.now()),
          user: {
            connect: {
              id: informationUser.id,
            }
          }
        }
      })

    } catch (error) {
      console.log(error)
    }
  }

  async deletePublication(id: string, req: any) {
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: id,
        deletedAt: null
      }
    })

    if (!publication) {
      return new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND);
    }

    const informationUser = getToken(req)

    if (publication.userId !== informationUser.id) {
      return new HttpException('Acão negada!', HttpStatus.UNAUTHORIZED);
    }

    try {
      this.prisma.$use(async (params, next) => {
        if (params.model == 'Publication') {
          if (params.action == 'delete') {

            params.action = 'update'
            params.args['data'] = { deletedAt: new Date(Date.now()) }
          }
        }
        return next(params)
      })

      await this.prisma.publication.delete({
        where: {
          id: id,
          deletedAt: null
        }
      })

      return new HttpException('Excluído com sucesso!', HttpStatus.OK);
    } catch (error) {
      console.log(error)
      return new HttpException('Erro ao excluir!', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
