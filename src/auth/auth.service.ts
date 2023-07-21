import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
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
}