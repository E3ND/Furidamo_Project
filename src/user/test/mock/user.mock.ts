export const mockUser = {
  id: '8263470f-1737-4374-a7cd-810cf32a70e9',
  name: 'bruno',
  email: 'bruno@gmail.com',
  password: '123',
  imageName: ['65252027376918620000-2025-Feb-17.png'],
  likePublications: [],
  token: '',
  createdAt: new Date('2025-02-17T15:58:20.477Z'),
  updatedAt: new Date('2025-02-17T16:19:12.734Z'),
  deletedAt: null
}

export const mockJwt = {
  signAsync: jest.fn().mockResolvedValue('fake-jwt-token'),
}

export const mockPrisma = {
  user: {
    findFirst: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(mockUser),
  }
}

export const mockAuthService = {
    signIn: jest.fn().mockResolvedValue('GIsYqHardeYofxO2ATuKiqgK8S88QGwSmw68lPokht2IPLr3ER5TkTgQ5pHK87Ju')
}

export const bcryptPassword = '$2b$10$Lq0i8PtFiZ0doe9YpccP7eAlE15C6ACUPgrvH4gpYH7YJS58BU9bO';