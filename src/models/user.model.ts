import {
  ERROR_MESSAGES,
  TAG_NAME_UPDATE_TIME_LIMIT,
} from '@/constants/app.constants';
import prismaService from '@/service/prismaService';
import {
  CreateUserDto,
  CreateUserWalletDto,
  UpdateUserDefaultWalletDto,
  UpdateUserDto,
} from '@/utils/dto/users.dto';

const prisma = prismaService.prisma;

export class UsersModel {
  static async getUserById(id: string, include?: Record<string, boolean>) {
    const user_id = id.split(':').pop() || id;

    return prisma.user.findUnique({
      where: {
        id: user_id,
      },
      include,
    });
  }

  static async getUserByTagName(
    tag_name: string,
    include?: Record<string, boolean>
  ) {
    return prisma.user.findUnique({
      where: {
        tag_name,
      },
      include,
    });
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
        tag_name_updated_at: new Date(), // Set initial tag_name_updated_at when user is created
      },
    });
  }

  static async createUserWallet(dto: CreateUserWalletDto) {
    return prisma.wallet.create({
      data: {
        user_id: dto.user_id,
        chain_type: dto.chain_type,
        address: dto.address,
      },
    });
  }

  static async updateUserDefaultWallet(dto: UpdateUserDefaultWalletDto) {
    return prisma.wallet.update({
      where: {
        id: dto.wallet_id,
        user_id: dto.user_id,
      },
      data: {
        is_default: true,
      },
    });
  }

  static async updateUser(id: string, dto: UpdateUserDto) {
    // Enforce tag name update time limit
    if (dto.tag_name) {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (user?.tag_name_updated_at) {
        const lastUpdate = new Date(user.tag_name_updated_at).getTime();
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate;

        if (timeSinceLastUpdate < TAG_NAME_UPDATE_TIME_LIMIT) {
          throw new Error(ERROR_MESSAGES.TAG_NAME_UPDATE_LIMIT);
        }
      }
    }

    const updateData: any = {
      display_name: dto.display_name,
      profile_picture_url: dto.profile_picture_url,
      about: dto.about,
    };

    // Only update tag_name_updated_at if tag_name is being updated
    if (dto.tag_name) {
      updateData.tag_name = dto.tag_name;
      updateData.tag_name_updated_at = new Date();
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
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
