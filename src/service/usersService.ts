import { CreateUserDto, UpdateUserDto } from '@/utils/dto/users.dto';
import { prismaService } from './prismaService';

const prisma = prismaService.prisma;

export class UsersService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  static async createUser(dto: CreateUserDto) {
    return prisma.user.create({
      data: {
        ...dto,
        id: dto.user_id,
      },
    });
  }

  static async updateUser(dto: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id: dto.user_id,
      },
      data: dto,
    });
  }

  static async deleteUser(userId: string) {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
