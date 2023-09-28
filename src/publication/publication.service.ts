import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getToken } from 'src/utils/get-token';
import * as fs from 'fs';
import { uploadFiles } from 'src/utils/uploadFiles';
import { IGetToken } from 'src/auth';

@Injectable()
export class PublicationService {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) { }

  async createPublication(createPublicationDto: CreatePublicationDto, req: any, imagesNames: string, videoName: string) {
    try {
      const informationUser:IGetToken.Params = getToken(req)
      let jsonImageNames: any = {
        name: []
      }

      let jsonVideoNames: any = {
        name: []
      }

      if (imagesNames != null) {
        for (let key of imagesNames) {
          jsonImageNames.name.push(key.toString())
        }
      } else {
        jsonImageNames.name = ['null']
      }

      if (videoName != null) {
        for (let key of videoName) {
          jsonVideoNames.name.push(key.toString())
        }
      } else {
        jsonVideoNames.name = ['null']
      }

      return await this.prisma.publication.create({
        data: {
          title: createPublicationDto.title,
          text: createPublicationDto.text,
          like: ['null'],
          deslike: ['null'],
          edited: false,
          imageName: jsonImageNames.name,
          videoName: jsonVideoNames.name,
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

    const informationUser:IGetToken.Params = getToken(req)

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

    const informationUser:IGetToken.Params = getToken(req)

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

  async likePublication(publicationId: string, req: any) {
    const informationUser:IGetToken.Params = getToken(req)
    let userLiked = false
   
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId
      }
    })

    if(!publication) return new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND);

    for(let i = 0; i < publication.like.length; i++) {
      if(publication.like[i] === informationUser.id) {
        publication.like.splice(i, 1)
        userLiked = true
      }
    }

    if(!userLiked) {
      publication.like.push(informationUser.id)

      for(let j = 0; j < publication.deslike.length; j++) {
        if(publication.deslike[j] === informationUser.id) {
          publication.deslike.splice(j, 1)

          await this.prisma.publication.update({
            where: {
              id: publicationId,
            },
            data: {
              deslike: publication.deslike
            }
          })
        }
      }
    }

    await this.prisma.publication.update({
      where: {
        id: publicationId
      },
      data: {
        like: publication.like
      }
    })

    return new HttpException('', HttpStatus.OK);
  }

  async deslikePublication(publicationId: string, req: any) {
    const informationUser:IGetToken.Params = getToken(req)
    let userDeslike = false
   
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId
      }
    })

    if(!publication) return new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND);

    for(let i = 0; i < publication.deslike.length; i++) {
      if(publication.deslike[i] === informationUser.id) {
        publication.deslike.splice(i, 1)
        userDeslike = true
      }
    }

    if(!userDeslike) {
      publication.deslike.push(informationUser.id)

      for(let j = 0; j < publication.like.length; j++) {
        if(publication.like[j] === informationUser.id) {
          publication.like.splice(j, 1)

          await this.prisma.publication.update({
            where: {
              id: publicationId,
            },
            data: {
              like: publication.like
            }
          })
        }
      }
    }

    await this.prisma.publication.update({
      where: {
        id: publicationId
      },
      data: {
        deslike: publication.deslike
      }
    })

    return new HttpException('', HttpStatus.OK);
  }

  async getPublicationsComments(publicationId: string) {
    const publication = await this.prisma.publication.findFirst({
      where: {
        id: publicationId
      },
      include: {
        comments: true,
      }
    })

    if(!publication) {
      throw new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND);
    }
    

    return new HttpException(publication, HttpStatus.OK)
  }
}
