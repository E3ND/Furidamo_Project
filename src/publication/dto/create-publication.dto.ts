import { IsOptional, IsString } from "class-validator";

export class CreatePublicationDto {
    @IsString()
    title: string;

    @IsString()
    text: string;

    @IsOptional()
    imageName: string;

    @IsOptional()
    videoName: string;
}
