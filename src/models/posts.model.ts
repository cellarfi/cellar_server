// NOTE: Run `npx prisma generate` to regenerate the Prisma client
// with the new FundingMeta model before using the updated methods

import prismaService from '@/service/prismaService'
import { CreatePostDto } from '@/utils/dto/socialfi.dto'

const prisma = prismaService.prisma

export class PostModel {
  static async getPosts() {
    return prisma.post.findMany({
      include: {
        _count: { select: { comment: true, like: true } },
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            wallet_address: true,
            chain_type: true,
            token_symbol: true,
            token_address: true,
            deadline: true,
            status: true,
          },
        },
        token_meta: {
          select: {
            token_name: true,
            token_symbol: true,
            token_address: true,
            chain_type: true,
            logo_url: true,
            launch_date: true,
            initial_price: true,
            target_price: true,
            market_cap: true,
            description: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  static async getPost(id: string) {
    return prisma.post.findUnique({
      where: { id: id },
      include: {
        comment: true,
        _count: { select: { comment: true, like: true } },
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            wallet_address: true,
            chain_type: true,
            token_symbol: true,
            token_address: true,
            deadline: true,
            status: true,
          },
        },
      },
    })
  }

  static async getMostLikedPosts(limit: number = 5) {
    return prisma.post.findMany({
      include: {
        _count: { select: { like: true } },
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            wallet_address: true,
            chain_type: true,
            token_symbol: true,
            token_address: true,
            deadline: true,
            status: true,
          },
        },
      },
      orderBy: {
        like: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }

  static async getMostCommentedPosts(limit: number = 5) {
    return prisma.post.findMany({
      include: {
        _count: { select: { comment: true } },
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            wallet_address: true,
            chain_type: true,
            token_symbol: true,
            token_address: true,
            deadline: true,
            status: true,
          },
        },
      },
      orderBy: {
        comment: {
          _count: 'desc',
        },
      },
      take: limit,
    })
  }

  static async searchPost(query: string) {
    return prisma.post.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        content: true,
        id: true,
        created_at: true,
        post_type: true,
        user: {
          select: {
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            status: true,
          },
        },
      },
    })
  }

  static async getUserPosts(user_id: string) {
    return prisma.post.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        id: true,
        content: true,
        created_at: true,
        post_type: true,
        _count: {
          select: {
            like: true,
            comment: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  static async createPost(createPost: CreatePostDto) {
    return prisma.post.create({
      data: {
        content: createPost.content,
        user_id: createPost.user_id,
        post_type: 'REGULAR', // Regular posts are always REGULAR type
      },
      include: {
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        _count: {
          select: {
            like: true,
            comment: true,
          },
        },
      },
    })
  }

  /**
   * Create a fundraising post (without funding metadata)
   * Funding metadata should be created separately using FundingMetaModel
   */
  static async createFundraisingPost(
    content: string,
    user_id: string,
    post_type: 'TOKEN_CALL' | 'DONATION'
  ) {
    return prisma.post.create({
      data: {
        content,
        user_id,
        post_type,
      },
      include: {
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        _count: {
          select: {
            like: true,
            comment: true,
          },
        },
      },
    })
  }

  /**
   * Get posts by type including funding metadata for fundraising posts
   */
  static async getPostsByType(
    post_type?: 'REGULAR' | 'TOKEN_CALL' | 'DONATION'
  ) {
    const whereClause: any = {}

    if (post_type) {
      whereClause.post_type = post_type
    }

    return prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        _count: {
          select: {
            like: true,
            comment: true,
            donations: true,
          },
        },
        funding_meta:
          post_type === 'REGULAR'
            ? false
            : {
                select: {
                  target_amount: true,
                  current_amount: true,
                  wallet_address: true,
                  chain_type: true,
                  token_symbol: true,
                  token_address: true,
                  deadline: true,
                  status: true,
                },
              },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  static async updatePost(post_id: string, user_id: string, content: string) {
    return prisma.post.update({
      where: {
        id: post_id,
        user_id: user_id, // Ensure only post author can update
      },
      data: {
        content: content,
      },
      include: {
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        _count: {
          select: {
            like: true,
            comment: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            status: true,
          },
        },
      },
    })
  }

  static async deletePost(post_id: string, user_id: string) {
    return prisma.post.delete({
      where: {
        id: post_id,
        user_id: user_id, // Ensure only post author can delete
      },
    })
  }

  static async getPostsWithCounts() {
    return prisma.post.findMany({
      include: {
        _count: {
          select: {
            like: true,
            comment: true,
          },
        },
        user: {
          select: {
            id: true,
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
        funding_meta: {
          select: {
            target_amount: true,
            current_amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }
}
