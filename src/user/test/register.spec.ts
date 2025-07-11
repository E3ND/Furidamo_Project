import { AuthController } from "src/auth/auth.contorller"
import { AuthService } from "src/auth/auth.service"
import { PrismaService } from "src/prisma/prisma.service"
import { bcryptPassword, mockAuthService, mockJwt, mockPrisma, mockUser } from "./mock/user.mock"
import { JwtService } from "@nestjs/jwt"
import { NodeMailerService } from "src/nodemailer/nodemailer.service"
import { Test, TestingModule } from "@nestjs/testing"
import { password } from "src/utils/password"
import { UserService } from "../user.service"
import { UserController } from "../user.controller"
import { HttpStatus } from "@nestjs/common"

jest.mock('src/utils/password');

describe('create user', () => {
    const user = {
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password
    };

    let userService: UserService

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
            ]
        }).compile();

        userService = module.get<UserService>(UserService);
    });

    it('User is created and needs to return a token', async () => {
        (password as jest.Mock).mockReturnValue(bcryptPassword);

        jest.spyOn(mockPrisma.user, 'findFirst').mockReturnValue(null);

        const response = await userService.createUser(user);

        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
            where: {
                email: mockUser.email,
                deletedAt: null
            }
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
        expect(response).toEqual('GIsYqHardeYofxO2ATuKiqgK8S88QGwSmw68lPokht2IPLr3ER5TkTgQ5pHK87Ju');
    });

    it('Trying to create an existing user', async () => {
        jest.spyOn(mockPrisma.user, 'findFirst').mockReturnValue(mockUser);

        await expect(userService.createUser(user)).rejects.toMatchObject({
            response: 'Usuário já existente!',
            status: HttpStatus.CONFLICT
        });
    });

    it('Error trying to create user', async () => {
        jest.spyOn(mockPrisma.user, 'findFirst').mockReturnValue(null);
        jest.spyOn(mockPrisma.user, 'create').mockRejectedValue(new Error('error'));

        await expect(userService.createUser(user)).rejects.toMatchObject({
            response: 'Erro no servidor, tente novamente mais tarde!',
            status: HttpStatus.INTERNAL_SERVER_ERROR
        });
    })
})