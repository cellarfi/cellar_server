import { LikeModel } from '@/models/like.model';
import { PostModel } from '@/models/posts.model';
import { PointsService } from '@/service/pointsService';
import { Request, Response } from 'express';

export const addLike = async (
  req: Request<{ post_id: string }, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const { post_id } = req.params;
    const user = req.user!;
    const user_id = user.id;
    console.log(post_id)

    if (!post_id) {
      res.status(404).json({
        success: false,
        error: 'Post ID not found in body',
      });
      return;
    }
    const post = await PostModel.getPost(post_id);

    if (!post) {
      res.status(400).json({
        success: false,
        error: 'Post does not exists.',
      });
      return;
    }
    const like = await LikeModel.addLike({
      user_id: user_id,
      post_id: post_id,
    });

    // Award points for liking a post
    try {
      await PointsService.awardPoints(user_id, 'POST_LIKE', {
        post_id,
        like_id: like.id,
      });

      // Also award points to post creator
      if (post.user_id && post.user_id !== user_id) {
        await PointsService.awardPoints(post.user_id, 'POST_LIKE', {
          post_id,
          like_id: like.id,
          liked_by: user_id,
        });
      }
    } catch (pointsError) {
      // Log but don't prevent the like operation if points can't be awarded
      console.error('[addLike] Error awarding points:', pointsError);
    }

    res.status(201).json({
      success: true,
      data: like,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred adding the like.',
    });
  }
};

export const deleteLike = async (
  req: Request<{}, {}, { id: string; post_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!;
    const user_id = user.id;
    const id = req.body.id;
    const post = req.body.post_id;

    if (id && post == null) {
      res.status(400).json({
        success: false,
        error: 'Like ID and Post ID missing in body',
      });
      return;
    }

    const deleteFunction = await LikeModel.deleteLike({
      user_id: user_id,
      id: id,
      post_id: post,
    });

    res.status(200).json({
      success: true,
      data: deleteFunction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred deleting the like.',
    });
  }
};
