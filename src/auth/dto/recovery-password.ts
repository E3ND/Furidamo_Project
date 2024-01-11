import { IsNotEmpty, IsString } from "class-validator";

export class recoveryPasswordDto {
    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    token: string;
}