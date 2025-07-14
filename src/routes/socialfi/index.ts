import {
  createPost,
  createComment,
  getPost,
  getPosts,
  deleteComment,
  deleteLike,
  addLike,
  searchPosts,
  searchUsers,
  userProfile,
  followUser,
  trendingPosts,
  suggestedAccounts,
  getFollowingPosts,
  getPopularHashtags,
  getPostsByHashtag,
} from "@/controllers/socialfiController";
import { authMiddleware } from "@/middleware/auth.middleware";
import { Router } from "express";

const router = Router();

// Post routes
router.get("/posts", authMiddleware, getPosts); // Get all posts
router.post("/post", authMiddleware, getPost); // Get specific post
router.post("/post/create", authMiddleware, createPost); // Create new post
router.get("/trending/posts", authMiddleware, trendingPosts); // Trending Posts
router.get("/suggested-accounts", authMiddleware, suggestedAccounts); // Get Suggested Accounts to follow
router.get("/personalized/posts", authMiddleware, getFollowingPosts);
router.get("/posts/hashtags/popular", authMiddleware, getPopularHashtags);
router.get("/posts/hashtag/:tag", authMiddleware, getPostsByHashtag);

// Comment routes
router.post("/posts/comment", authMiddleware, createComment); // Create comment on post
router.delete("/posts/comment", authMiddleware, deleteComment); // Delete comment

// Like routes
router.post("/posts/like", authMiddleware, addLike); // Add like to post
router.post("/posts/unlike", authMiddleware, deleteLike); // Remove like from post

// Search Routes
router.get("/posts/query", authMiddleware, searchPosts);
router.get("/search/users", authMiddleware, searchUsers);

// User Profile
router.get("/user-profile", authMiddleware, userProfile);
router.post("/follow-user", authMiddleware, followUser);

export default router;
