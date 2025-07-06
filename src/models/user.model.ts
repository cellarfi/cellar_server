import prismaService from '@/service/prismaService'
import { CreateUserDto, UpdateUserDto } from '@/utils/dto/users.dto'

const prisma = prismaService.prisma

export class UsersModel {
  static async getUserById(id: string) {
    const user_id = id.split(':').pop() || id

    return prisma.user.findUnique({
      where: {
        id: user_id,
      },
    })
  }

  static async createUser(dto: CreateUserDto) {
    return prisma.user.create({
      data: {
        id: dto.id,
        email: dto.email,
        display_name: dto.display_name,
        tag_name: dto.tag_name,
        profile_picture_url: dto.profile_picture_url,
        about: dto.about,
        created_at: dto.created_at,
      },
    })
  }

  static async updateUser(id: string, dto: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        display_name: dto.display_name,
        tag_name: dto.tag_name,
        profile_picture_url: dto.profile_picture_url,
        about: dto.about,
      },
    })
  }

  static async deleteUser(userId: string) {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })
  }
}
