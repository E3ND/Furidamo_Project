import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { ChatService } from "./chat.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService
    ) {}

    @UseGuards(AuthGuard)
    @Post('/message/:recipientId')
    async createMessage(@Body() createMessageDto: CreateMessageDto, @Param('recipientId') recipientId: string, @Req() req: Request) {
        return await this.chatService.createMessage(createMessageDto, recipientId, req)
    }

    @UseGuards(AuthGuard)
    @Get('/messages/')
    async chatByUser(@Req() req: Request) {
        return await this.chatService.chatByUser(req)
    }
}