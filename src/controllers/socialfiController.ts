import { Request, Response, NextFunction } from "express";
import { SocialFi } from "@/models/socialfi.model";
import { UsersModel } from "@/models/user.model";
import { authMiddleware } from "@/middleware/auth.middleware";
import { getUserByToken } from "@/utils/auth";
import prismaService from "@/service/prismaService";

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserByToken(req);
  const user_id = user.id;
  try {
    const posts = await SocialFi.getPosts();
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const like = await prismaService.prisma.like.findFirst({
          where: { postId: post.id, userId: user_id },
        });
        return {
          ...post,
          like: {
            status: !!like,
            id: like?.id,
          },
        };
      })
    );
    res.status(200).json({
      success: true,
      data: postsWithLikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching posts.",
    });
  }
};

export const trendingPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await getUserByToken(req);
  const user_id = user.id;
  try {
    const posts = await SocialFi.getMostLikedPosts();
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const like = await prismaService.prisma.like.findFirst({
          where: { postId: post.id, userId: user_id },
        });
        return {
          ...post,
          like: {
            status: !!like,
            id: like?.id,
          },
        };
      })
    );
    res.status(200).json({
      success: true,
      data: postsWithLikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching posts.",
    });
  }
};

export const suggestedAccounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await getUserByToken(req);
  const user_id = user.id;
  try {
    const suggestedAccounts = await SocialFi.suggestedAccounts(user_id);

    // if (!suggestedAccounts) {
    //   res.status(404).json({
    //     success: false,
    //     error: "No suggested accounts found",
    //   });
    //   return;
    // }
    res.status(200).json({
      success: true,
      data: suggestedAccounts,
    });
  } catch (error) {
    console.error("Error fetching suggested accounts:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred fetching suggested accounts.",
    });
  }
};

export const getFollowingPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await getUserByToken(req);
  const user_id = user.id;
  try {
    const posts = await SocialFi.getFollowingPosts(user_id);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching the posts.",
    });
  }
};

export const getPost = async (
  req: Request<{}, {}, { id: string }>,
  res: Response
): Promise<void> => {
  const user = await getUserByToken(req);
  const user_id = user.id;
  const id = req.body.id;
  try {
    const post = await SocialFi.getPost(id);
    const like = await prismaService.prisma.like.findFirst({
      where: { postId: req.body.id, userId: user_id },
    });

    const data = {
      ...post,
      like: {
        status: like ? true : false,
        id: like?.id,
      },
    };
    console.log(data);
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching the post.",
    });
  }
};

export const createPost = async (
  req: Request<{}, {}, { message: string; trends: any }>,
  res: Response
): Promise<void> => {
  try {
    const message = req.body.message;
    const trends = req.body.trends;

    if (!message) {
      res.status(400).json({
        success: false,
        error: "Post message can't be empty",
      });
      return;
    }

    const user = await getUserByToken(req);
    const user_id = user.id;
    if (!user) {
      console.log(user);
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }
    const users = await prismaService.prisma.user.findFirst();
    console.log(users, user.id);

    const post = await SocialFi.createPost({
      message: message,
      owner_id: user_id,
      trends: trends,
    });
    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred creating the post." + error,
    });
  }
};

export const createComment = async (
  req: Request<{}, {}, { postId: string; text: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const comment = await SocialFi.createComment({
      postId: req.body.postId,
      text: req.body.text,
      userId: user_id,
    });
    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred creating the comment.",
    });
  }
};

export const addLike = async (
  req: Request<{}, {}, { postId: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;

    if (!req.body.postId) {
      res.status(404).json({
        success: false,
        error: "Post ID not found in body",
      });
      return;
    }
    const post = await SocialFi.getPost(req.body.postId);
    if (!post) {
      res.status(400).json({
        success: false,
        error: "Post does not exists.",
      });
      return;
    }
    const like = await SocialFi.addLike({
      userId: user_id,
      postId: req.body.postId,
    });
    res.status(201).json({
      success: true,
      data: like,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred adding the like.",
    });
  }
};

export const deleteComment = async (
  req: Request<{}, {}, { id: string; postId: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const id = req.body.id;
    const post = req.body.postId;

    if (id && post == null) {
      res.status(400).json({
        success: false,
        error: "Like ID and Post ID missing in body",
      });
    }

    const deleteFunction = await SocialFi.deleteComment({
      userId: user_id,
      id: id,
      postId: post,
    });

    res.status(200).json({
      success: true,
      data: deleteFunction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred deleting the comment.",
    });
  }
};

export const deleteLike = async (
  req: Request<{}, {}, { id: string; postId: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const id = req.body.id;
    const post = req.body.postId;

    if (id && post == null) {
      res.status(400).json({
        success: false,
        error: "Like ID and Post ID missing in body",
      });
      return;
    }

    const deleteFunction = await SocialFi.deleteLike({
      userId: user_id,
      id: id,
      postId: post,
    });

    res.status(200).json({
      success: true,
      data: deleteFunction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred deleting the like.",
    });
  }
};

export const searchPosts = async (
  req: Request<{}, {}, {}, { query: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const query = req.query.query;

    if (!query) {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    const posts = await SocialFi.searchPost(query);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred searching for posts.",
    });
  }
};

export const searchUsers = async (
  req: Request<{}, {}, {}, { query: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const query = req.query.query;

    if (!query) {
      res.status(400).json({
        success: false,
        error: "Search query is required",
      });
      return;
    }

    const users = await SocialFi.searchUser(query);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred searching for users.",
    });
  }
};

export const userProfile = async (
  req: Request<{}, {}, {}, { query: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const query = req.query.query;

    if (!query) {
      res.status(400).json({
        success: false,
        error: "ID query is required",
      });
      return;
    }

    const data = await SocialFi.userProfile(query, user_id);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred getting the user profile",
    });
  }
};

export const followUser = async (
  req: Request<{}, {}, { userId: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserByToken(req);
    const user_id = user.id;
    const id = req.body.userId;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "ID query is required",
      });
      return;
    }

    const data = await SocialFi.followUser(id, user_id);

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred getting the user profile",
    });
  }
};

export const getPopularHashtags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const hashtags = await SocialFi.getPopularHashtags(10);
    res.status(200).json({
      success: true,
      data: hashtags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching popular hashtags.",
    });
  }
};

export const getPostsByHashtag = async (
  req: Request,
  res: Response
): Promise<void> => {
  const tag = req.params.tag;
  if (!tag) {
    res.status(400).json({
      success: false,
      error: "Hashtag is required",
    });
    return;
  }
  try {
    const posts = await SocialFi.getPostsByHashtag(tag);
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred fetching posts by hashtag.",
    });
  }
};
