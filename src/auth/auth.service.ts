import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs-extra';
import * as cheerio from 'cheerio';
import * as jwt from 'jsonwebtoken'

import { PrismaService } from 'src/prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { NodeMailerService } from 'src/nodemailer/nodemailer.service';
import { recoveryPasswordDto } from './dto/recovery-password';
import { password } from 'src/utils/password';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly nodeMailerService: NodeMailerService,
    ) {}

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
        where: {
            email: email,
            deletedAt: null
        }
    })
    
    if(!user) {
      return new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, email: user.email, name: user.name };
    return {
      user_id: user.id,
      access_token: await this.jwtService.signAsync(payload),
    };

  }

  async forgotPassword(params: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: params.email
      }
    })

    if(!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
    }

    const payload = {
      userId: user.id,
      userEmail: user.email,
      userName: user.name
    }

    const token = jwt.sign(
      payload,
      process.env.FORGOT_PASSWORD_SECRET,
      { expiresIn: '1h' }
    )

    console.log(token)

    const htmlTemplate = await fs.readFile('templates/forgot-password-template.html', 'utf-8');

    const $ = cheerio.load(htmlTemplate)

    $('#link').html(`<a href="http://furidamo.com/auth/recovery-password/${token}" target="_blank"><button>Redefinir senha</button></a>`);

    await fs.writeFile('templates/forgot-password.html', $.html());

    const html = await fs.readFile('templates/forgot-password.html', 'utf-8');

    await this.prisma.user.update({
      where: {
        id: user.id
      },
      data : {
        token: token
      }
    })

    await this.nodeMailerService.sendMail({
      emailService: process.env.EMAIL,
      emailUser: user.email,
      bodySubject: 'Recuperação de senha',
      body: 'Recuperação de senha',
      html: html
    })

    fs.unlink('templates/forgot-password.html')
  }

  async recoveryPassword(params: recoveryPasswordDto) {
    let userInformation = null
    jwt.verify(params.token, process.env.FORGOT_PASSWORD_SECRET, (err, decoded) => {
      if(err) {
        throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED)
      }
      return userInformation = decoded
    })

    if(params.email !== userInformation.userEmail) {
      throw new HttpException('Não autorizado', HttpStatus.UNAUTHORIZED)
    }

    const passwordHash = await password(params.password)

    await this.prisma.user.update({
      where: {
        id: userInformation.userId
      },
      data: {
        password: passwordHash
      }
    })

    const payload = { id: userInformation.userId, email: userInformation.userEmail, name: userInformation.userName };
    return {
      user_id: userInformation.userId,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}