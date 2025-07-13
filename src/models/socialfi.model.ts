import prismaService from "@/service/prismaService";
import {
  addLikeDto,
  createCommentDto,
  CreatePostDto,
  deleteCommentDto,
  deleteLikeDto,
  tipUserDto,
} from "@/utils/dto/socialfi.dto";

const prisma = prismaService.prisma;

export class SocialFi {
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getPost(id: string) {
    return prisma.post.findUnique({
      where: { id: id },
      include: {
        comment: true,
        _count: { select: { comment: true, like: true } },
        user: {
          select: {
            tag_name: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
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
      },
      orderBy: {
        like: {
          _count: "desc",
        },
      },
      take: limit,
    });
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
      },
      orderBy: {
        comment: {
          _count: "desc",
        },
      },
      take: limit,
    });
  }

  static async searchPost(query: string) {
    return prisma.post.findMany({
      where: {
        message: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        message: true,
        id: true,
        createdAt: true,
        user: {
          select: {
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
  }

  static async searchUser(query: string) {
    return prisma.user.findMany({
      where: {
        display_name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        display_name: true,
        tag_name: true,
        profile_picture_url: true,
      },
    });
  }

  static async userProfile(id: string, userId: string) {
    const existingFollow = await prisma.follower.findFirst({
      where: {
        userId: id,
        followerId: userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        display_name: true,
        tag_name: true,
        profile_picture_url: true,
        _count: {
          select: {
            Followers: true,
            Following: true,
          },
        },
      },
    });

    const posts = await prisma.post.findMany({
      where: {
        ownerId: id,
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
    });

    const data = {
      user,
      posts,
      following: existingFollow ? true : false,
    };

    return data;
  }

  static async suggestedAccounts(userId: string) {
    // Get users with highest number of followers
    const topUsers = await prismaService.prisma.user.findMany({
      select: {
        id: true,
        display_name: true,
        tag_name: true,
        profile_picture_url: true,
        _count: {
          select: {
            Followers: true,
          },
        },
      },
      orderBy: {
        Followers: {
          _count: "desc",
        },
      },
      take: 10, // Get top 10 users
    });

    // Check if current user follows each suggested account
    const suggestedAccounts = await Promise.all(
      topUsers.map(async (user) => {
        const existingFollow = await prismaService.prisma.follower.findFirst({
          where: {
            userId: user.id,
            followerId: userId,
          },
        });

        return {
          id: user.id,
          display_name: user.display_name,
          tag_name: user.tag_name,
          _count: user._count,
          profile_picture_url: user.profile_picture_url,
          following: !!existingFollow,
        };
      })
    );

    return suggestedAccounts;
  }

  static async getFollowingPosts(userId: string) {
    // Get the list of users the current user is following
    const following = await prismaService.prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      select: {
        userId: true,
      },
    });

    // Extract the user IDs of the followed users
    const followingIds = following.map((f) => f.userId);

    // Get posts from followed users, ordered by most recent
    const posts = await prismaService.prisma.post.findMany({
      where: {
        ownerId: {
          in: followingIds,
        },
      },
      orderBy: {
        createdAt: "desc",
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
    });

    return posts;
  }

  static async createPost(createPost: CreatePostDto) {
    return prisma.post.create({
      data: {
        message: createPost.message,
        ownerId: createPost.owner_id,
        hashtag: createPost.trends,
      },
    });
  }

  static async addLike(like: addLikeDto) {
    await prisma.post.update({
      where: { id: like.postId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });
    return prisma.like.create({
      data: {
        postId: like.postId,
        userId: like.userId,
      },
    });
  }

  static async createComment(comment: createCommentDto) {
    await prisma.post.update({
      where: { id: comment.postId },
      data: {
        comments: {
          increment: 1,
        },
      },
    });
    return prisma.comment.create({
      data: {
        userId: comment.userId,
        text: comment.text,
        postId: comment.postId,
      },
    });
  }

  static async deleteComment(comment: deleteCommentDto) {
    await prisma.post.update({
      where: { id: comment.postId },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });
    return prisma.comment.delete({
      where: { id: comment.id, userId: comment.userId, postId: comment.postId },
    });
  }

  static async deleteLike(like: deleteLikeDto) {
    // First delete the like record
    const deletedLike = await prisma.like.delete({
      where: { id: like.id, postId: like.postId, userId: like.userId },
    });

    // Then update the post's like count
    await prisma.post.update({
      where: { id: like.postId },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });

    return deletedLike;
  }

  static async tipUser(tip: tipUserDto) {
    const { postId, amount } = tip;
  }

  static async followUser(id: string, userId: string) {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the follow relationship already exists
    const existingFollow = await prisma.follower.findFirst({
      where: {
        userId: userId,
        followerId: id,
      },
    });

    if (existingFollow) {
      // If it exists, unfollow by deleting the relationship
      await prisma.follower.delete({
        where: {
          id: existingFollow.id,
        },
      });
      return { action: "unfollowed" };
    } else {
      // If it doesn't exist, create the follow relationship
      await prisma.follower.create({
        data: {
          userId: userId,
          followerId: id,
        },
      });
      return { action: "followed" };
    }
  }

  static async getPopularHashtags(limit: number = 10) {
    // Aggregate hashtags from all posts
    const posts = await prisma.post.findMany({
      select: { hashtag: true },
    });
    const hashtagCounts: Record<string, number> = {};
    posts.forEach((post) => {
      if (Array.isArray(post.hashtag)) {
        post.hashtag.forEach((tag: string) => {
          const normalized = tag.toLowerCase();
          hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
        });
      }
    });
    // Convert to array and sort by count
    const sorted = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
    return sorted;
  }

  static async getPostsByHashtag(tag: string) {
    // Find posts where hashtag array contains the tag (case-insensitive)
    const posts = await prisma.post.findMany({
      where: {
        hashtag: {
          array_contains: [tag],
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });
    // Fallback for case-insensitive search if needed
    if (posts.length === 0) {
      const allPosts = await prisma.post.findMany({
        where: {
          hashtag: {
            not: null,
          },
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
        orderBy: {
          createdAt: "desc",
        },
      });
      return allPosts.filter(
        (post) =>
          Array.isArray(post.hashtag) &&
          post.hashtag.some(
            (t: string) => t.toLowerCase() === tag.toLowerCase()
          )
      );
    }
    return posts;
  }
}
