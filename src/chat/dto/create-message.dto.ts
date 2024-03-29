import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    message: string;
}