import { FollowModel } from '@/models/follow.model'
import { PointsService } from '@/service/pointsService'
import { Request, Response } from 'express'

export const suggestedAccounts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user!
  const user_id = user.id
  try {
    const suggestedAccounts = await FollowModel.suggestedAccounts(user_id)

    res.status(200).json({
      success: true,
      data: suggestedAccounts,
    })
  } catch (error) {
    console.error('Error fetching suggested accounts:', error)
    res.status(500).json({
      success: false,
      error: 'An error occurred fetching suggested accounts.',
    })
  }
}

export const getFollowingPosts = async (
  req: Request<{}, {}, {}, {page: number, pageSize: number}>,
  res: Response
): Promise<void> => {
  const user = req.user!
  const user_id = user.id;

  // Get pagination data from query parameter
  const page = Number(req.query.page) || 10;
  const pageSize = Number(req.query.pageSize) || 1;

  const skip = (page - 1) * pageSize;
  const take = pageSize;
  const totalPosts = await FollowModel.getFollowingPostsCount(user_id);
  const totalPages = Math.ceil(totalPosts / pageSize);
  
  try {
    const posts = await FollowModel.getFollowingPosts(user_id, take, skip);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        pageSize,
        totalPosts,
        totalPages
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred fetching the posts.',
    })
  }
}

export const followUser = async (
  req: Request<{}, {}, { user_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!
    const user_id = user.id
    const id = req.body.user_id

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      })
      return
    }

    const data = await FollowModel.followUser(user_id, id)

    // Award points for following a user
    try {
      // Award points to the user who followed
      await PointsService.awardPoints(user_id, 'USER_FOLLOW', { followed_user_id: id })
      
      // Award points to the user being followed (they're gaining a follower)
      await PointsService.awardPoints(id, 'USER_FOLLOW', { follower_user_id: user_id })
    } catch (pointsError) {
      // Log but don't prevent follow if points can't be awarded
      console.error('[followUser] Error awarding points:', pointsError)
    }

    res.status(200).json({
      success: true,
      data: data,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred following the user',
    })
  }
}
