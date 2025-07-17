import prismaService from '@/service/prismaService'
import { createCommentDto, deleteCommentDto } from '@/utils/dto/socialfi.dto'

const prisma = prismaService.prisma

export class CommentModel {
  static async createComment(comment: createCommentDto) {
    return prisma.comment.create({
      data: {
        user_id: comment.user_id,
        content: comment.text, // Map text to content field
        post_id: comment.post_id,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }

  static async deleteComment(comment: deleteCommentDto) {
    return prisma.comment.delete({
      where: {
        id: comment.id,
        user_id: comment.user_id,
        post_id: comment.post_id,
      },
    })
  }

  static async getCommentsByPost(post_id: string) {
    return prisma.comment.findMany({
      where: { post_id },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            profile_picture_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  static async getCommentsByUser(user_id: string) {
    return prisma.comment.findMany({
      where: { user_id },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                tag_name: true,
                profile_picture_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  }

  static async updateComment(
    comment_id: string,
    user_id: string,
    content: string
  ) {
    return prisma.comment.update({
      where: {
        id: comment_id,
        user_id: user_id, // Ensure only comment owner can update
      },
      data: {
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }
}
