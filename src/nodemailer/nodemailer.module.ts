import { Module } from "@nestjs/common";
import { NodeMailerService } from "./nodemailer.service";

@Module({
    controllers: [],
    providers: [NodeMailerService]
  })
  
export class NodemailerModule {}