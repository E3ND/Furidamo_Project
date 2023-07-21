import { IsEmail, IsString } from "class-validator";

export class loginUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    password: string;

}