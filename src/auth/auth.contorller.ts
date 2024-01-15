import { Body, Controller, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ForgotPasswordDto } from "./dto/forgot-password";
import { AuthService } from "./auth.service";
import { recoveryPasswordDto } from "./dto/recovery-password";
import { AuthGuard } from "./auth.guard";
import { ChangePasswordDto } from "./dto/change-password";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('/fotgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return await this.authService.forgotPassword(forgotPasswordDto)
    }

    @Put('/recovery-password')
    async recoveryPassword(@Body() recoveryPasswordDto: recoveryPasswordDto) {
        return await this.authService.recoveryPassword(recoveryPasswordDto)
    }

    @UseGuards(AuthGuard)
    @Put('/change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
        return await this.authService.changePassword(changePasswordDto, req)
    }
}