import { Body, Controller, Param, Patch, Delete, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentService } from "./comment.service";
import { UpdateCommentDto } from "./dto/update-comment.dto";

@Controller('comment')
export class CommentController {
    constructor(
        private readonly commentService: CommentService
    ) {}

    @UseGuards(AuthGuard)
    @Post('/create/:publicationId') 
    async createComment(@Param('publicationId') publicationId: string, @Req() req: Request ,@Body() createCommentDto: CreateCommentDto) {
        return await this.commentService.createComment(publicationId, req, createCommentDto)
    }

    @UseGuards(AuthGuard)
    @Patch('/update/:commentId') 
    async updateComment(@Param('commentId') commentId: string, @Req() req: Request, @Body() updateCommentDto: UpdateCommentDto) {
        return await this.commentService.updateComment(commentId, req, updateCommentDto)
    }

    @UseGuards(AuthGuard)
    @Delete('/delete/:commentId') 
    async deleteComment(@Param('commentId') commentId: string, @Req() req: Request,) {
        return await this.commentService.deleteComment(commentId, req)
    }

    //Like and Deslike
    @UseGuards(AuthGuard)
    @Patch('/like/:commentId') 
    async likeComment(@Param('commentId') commentId: string, @Req() req: Request,) {
        return await this.commentService.likeComment(commentId, req)
    }

    @UseGuards(AuthGuard)
    @Patch('/deslike/:commentId') 
    async deslikeComment(@Param('commentId') commentId: string, @Req() req: Request,) {
        return await this.commentService.deslikeComment(commentId, req)
    }
}