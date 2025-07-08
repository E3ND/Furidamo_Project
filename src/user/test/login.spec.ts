import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { AuthController } from "src/auth/auth.contorller";
import { PrismaService } from "src/prisma/prisma.service";
import { NodeMailerService } from "src/nodemailer/nodemailer.service";

import { bcryptPassword, mockAuthService, mockJwt, mockPrisma, mockUser } from "./mock/user.mock";
import { HttpStatus } from "@nestjs/common";
import { UserService } from "../user.service";
import { UserController } from "../user.controller";
import { password } from 'src/utils/password';

jest.mock('src/utils/password');

interface ILoginResponse {
  user_id: string;
  access_token: string
}

describe("User Login", () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma
        },
        {
          provide: JwtService,
          useValue: mockJwt
        },
        NodeMailerService
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should login and return user_id and access_token when successful', async () => {

    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

    const response: ILoginResponse = await authService.signIn(mockUser.email, mockUser.password);

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: 'bruno@gmail.com',
        deletedAt: null,
      },
    });

    expect(mockJwt.signAsync).toHaveBeenCalledWith({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    })

    expect(response.access_token).toEqual('fake-jwt-token');
    expect(response.user_id).toEqual(mockUser.id);
    expect(typeof response.access_token).toBe('string');
  });

  it('Return error for user not found', async () => {
    jest.spyOn(mockPrisma.user, 'findFirst').mockResolvedValue(undefined);

    await expect(authService.signIn('inexistente@gmail.com', '123')).rejects.toMatchObject({
      response: 'Usuário não encontrado',
      status: HttpStatus.NOT_FOUND,
    });
  })

  it('Return error for wrong password', async () => {
    jest.spyOn(mockPrisma.user, 'findFirst').mockResolvedValue(mockUser);
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

    await expect(authService.signIn(mockUser.email, 'senhaerrada')).rejects.toMatchObject({
      response: 'Email ou senha incorretos',
      status: HttpStatus.UNAUTHORIZED
    });
  })
})

describe("User create", () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma
        },
        {
          provide: JwtService,
          useValue: mockJwt
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        },
        NodeMailerService
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('It should create the user successfully', async () => {
    const createUser = {
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password
    }

    jest.spyOn(mockPrisma.user, 'findFirst').mockResolvedValue(null);

    (password as jest.Mock).mockReturnValue(bcryptPassword);

    const response = await userService.createUser(createUser);

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        email: mockUser.email,
        deletedAt: null,
      },
    });

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: mockUser.name,
          email: mockUser.email,
          password: bcryptPassword,
          imageName: [] 
        }
    });

    expect(typeof response).toBe('string');
  });

  it('Error because the user already exists', async () => {
    const createUser = {
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password
    };

    jest.spyOn(mockPrisma.user, 'findFirst').mockResolvedValue(mockUser);

    await expect(userService.createUser(createUser)).rejects.toMatchObject({
      response: 'Usuário já existente!',
      status: HttpStatus.CONFLICT
    });
  });

  it('Internal processing error without explanation', async () => {
    const createUser = {
      name: mockUser.name,
      email: mockUser.email,
      password: mockUser.password
    }

    jest.spyOn(mockPrisma.user, 'findFirst').mockResolvedValue(null);

    (password as jest.Mock).mockReturnValue(bcryptPassword);

    jest.spyOn(mockPrisma.user, 'create').mockRejectedValue(new Error('error'));

    await(expect(userService.createUser(createUser)).rejects.toMatchObject({
      response: 'Erro no servidor, tente novamente mais tarde!',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    }))
  })
})
