import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { IGetToken } from "src/auth";
import { getToken } from "src/utils/get-token";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
    ) {}

    async createMessage(createMessageDto: CreateMessageDto, recipientId: string, req: any) {
        const informationUser:IGetToken.Params = getToken(req)

        const recipient = await this.prisma.user.findUnique({
            where : {
                id: recipientId,
                deletedAt: null
            }
        })

        if(!recipient) {
            throw new HttpException('Este usuário não existe', HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const thisRecipientExistsChat = await this.prisma.chat.findFirst({
            where: {
                senderId: informationUser.id,
                recipientId: recipientId,
            },
            include: {
                conversation: {
                    include: {
                        chatUser: true
                    }
                },
                
            }
        })

        try {
            
            if(!thisRecipientExistsChat) {
                const conversation = await this.prisma.conversation.create({
                    data: {
                        chat: {
                            create: {
                                message: createMessageDto.message,
                                senderId: informationUser.id,
                                recipientId: recipientId,
                            },
                        },
                        chatUser: {
                            create: {
                                userId: informationUser.id,
                            }
                        }
                        
                    }
                })

                await this.prisma.chatUser.create({
                    data: {
                        userId: recipientId,
                        conversationId: conversation.id
                    }
                })
            } else {
                await this.prisma.chat.create({
                    data: {
                        message: createMessageDto.message,
                        senderId: informationUser.id,
                        recipientId: recipientId,
                        conversationId: thisRecipientExistsChat.conversation.id
                    }
                    
                })
            }
            
        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao enviar a menssagem, tente novamente', HttpStatus.BAD_REQUEST)
        }


    }

    async chatByUser(req: any) {
        const informationUser:IGetToken.Params = getToken(req)

        return await this.prisma.chatUser.findMany({
            where: {
                userId: informationUser.id
            },
            include: {
                conversation: {
                    include: {
                        chat: true
                    }
                }
            }
        })
    }
}