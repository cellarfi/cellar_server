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
        id: dto.user_id,
        username: dto.username,
        profile_picture_url: dto.profile_picture_url,
        about: dto.about,
      },
    });
  }

  static async updateUser(dto: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id: dto.user_id,
      },
      data: {
        username: dto.username,
        profile_picture_url: dto.profile_picture_url,
        about: dto.about,
      },
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
