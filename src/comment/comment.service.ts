import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { getToken } from "src/utils/get-token";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { IGetToken } from "src/auth";

@Injectable()
export class CommentService {
    constructor(
        private prisma: PrismaService,
    ) { }

    async createComment(publicationId: string, req: any, createCommentDto: CreateCommentDto) {
        const informationUser:IGetToken.Params = getToken(req)

        const publication = await this.prisma.publication.findFirst({
            where: {
                id: publicationId,
                deletedAt: null
            }
        })

        if (!publication) {
            return new HttpException('Publicação não encontrada!', HttpStatus.NOT_FOUND)
        }

        try {
            return await this.prisma.comment.create({
                data: {
                    text: createCommentDto.text,
                    edited: false,
                    user: {
                        connect: {
                            id: informationUser.id
                        }
                    },
                    publication: {
                        connect: {
                            id: publicationId
                        }
                    }
                },
            })
        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao criar um comentário!', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async updateComment(commentId: string, req: any, updateCommentDto: UpdateCommentDto) {
        const informationUser:IGetToken.Params = getToken(req)
        
        const comment = await this.prisma.comment.findFirst({
            where: {
                id: commentId,
                deletedAt: null
            },
            include: {
                user: true
            }
        })

        if(!comment) throw new HttpException('Comentário não encontrado!', HttpStatus.NOT_FOUND)

        if (informationUser.id !== comment.user.id) {
            throw new HttpException('Não se pode alterar o comentário de outra pessoa!', HttpStatus.UNAUTHORIZED)
        }

        const data = {
            text: updateCommentDto.text,
            imageName: null,
            videoName: null,
            edited: true,
            updatedAt: new Date(Date.now()),
        }

        try {
            await this.prisma.comment.update({
                where: {
                    id: commentId,
                },
                data: {
                    ...data,
                    user: {
                        connect: {
                            id: informationUser.id
                        }
                    }
                }
            })

            return new HttpException('Atualizado com sucesso!', HttpStatus.INTERNAL_SERVER_ERROR)
        } catch (error) {
            console.log(error)
            throw new HttpException('Erro au atualizar o comentário, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async deleteComment(commentId: string, req: any) {
        const informationUser:IGetToken.Params = getToken(req)

        const comment = await this.prisma.comment.findFirst({
            where: {
                id: commentId,
                deletedAt: null
            },
            include: {
                user: true,
            }
        })

        if(!comment) throw new HttpException('Comentário não encontrado!', HttpStatus.NOT_FOUND)

        if(comment.user.id !== informationUser.id) {
            throw new HttpException('Não se pode excluir o comentário de outra pessoa!', HttpStatus.UNAUTHORIZED)
        }

        this.prisma.$use(async(params, next) => {
            if(params.model == 'Comment') {
              if(params.action == 'delete') {
      
                params.action = 'update'
                params.args['data'] = {deletedAt: new Date(Date.now()) }
              }
            }
            return next(params)
          })

        try {
            await this.prisma.comment.delete({
                where: {
                    id: commentId
                }
            })

            return new HttpException('Excluído com sucesso!', HttpStatus.OK)
        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao tentar excluir o comentário, tente novamente mais tarde!', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async likeComment(commentId: string, req) {
        const informationUser:IGetToken.Params = getToken(req)

        let userLiked = false
   
        const comment = await this.prisma.comment.findFirst({
          where: {
            id: commentId
          }
        })
    
        if(!comment) return new HttpException('Comentário não encontrada!', HttpStatus.NOT_FOUND);
    
        for(let i = 0; i < comment.like.length; i++) {
          if(comment.like[i] === informationUser.id) {
            comment.like.splice(i, 1)
            userLiked = true
          }
        }
    
        if(!userLiked) {
            comment.like.push(informationUser.id)
    
          for(let j = 0; j < comment.deslike.length; j++) {
            if(comment.deslike[j] === informationUser.id) {
                comment.deslike.splice(j, 1)
    
              await this.prisma.comment.update({
                where: {
                  id: commentId,
                },
                data: {
                  deslike: comment.deslike
                }
              })
            }
          }
        }
    
        await this.prisma.comment.update({
          where: {
            id: commentId
          },
          data: {
            like: comment.like
          }
        })
    
        return new HttpException('', HttpStatus.OK);
    }

    async deslikeComment(commentId: string, req) {
        const informationUser:IGetToken.Params = getToken(req)
        let userDeslike = false
       
        const comment = await this.prisma.comment.findFirst({
          where: {
            id: commentId
          }
        })
    
        if(!comment) return new HttpException('Comentário não encontrada!', HttpStatus.NOT_FOUND);
    
        for(let i = 0; i < comment.deslike.length; i++) {
          if(comment.deslike[i] === informationUser.id) {
            comment.deslike.splice(i, 1)
            userDeslike = true
          }
        }
    
        if(!userDeslike) {
            comment.deslike.push(informationUser.id)
    
          for(let j = 0; j < comment.like.length; j++) {
            if(comment.like[j] === informationUser.id) {
                comment.like.splice(j, 1)

              await this.prisma.comment.update({
                where: {
                  id: commentId,
                },
                data: {
                  like: comment.like
                }
              })
            }
          }
        }
    
        await this.prisma.comment.update({
          where: {
            id: commentId
          },
          data: {
            deslike: comment.deslike
          }
        })
    
        return new HttpException('', HttpStatus.OK);
    }
}