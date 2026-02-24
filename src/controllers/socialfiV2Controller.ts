import { NotificationService } from '@/service/notificationService'
import { PointsService } from '@/service/pointsService'
import prismaService from '@/service/prismaService'
import { TapestryService } from '@/service/tapestryService'
import {
  CreateCommentV2Dto,
  CreatePostV2Dto,
  FollowUserV2Dto,
  LikePostV2Dto,
  createCommentV2Schema,
  createPostV2Schema,
  followUserV2Schema,
  likePostV2Schema,
} from '@/utils/dto/socialfi.dto'
import { Request, Response } from 'express'
import { Follower } from '../../generated/prisma'

const prisma = prismaService.prisma

async function ensureTapestryProfileForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallets: {
        where: { is_default: true },
        take: 1,
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.tapestry_profile_id) {
    return { user, tapestryProfileId: user.tapestry_profile_id }
  }

  const defaultWallet = user.wallets[0]
  if (!defaultWallet) {
    throw new Error('User has no default wallet')
  }

  const profile = await TapestryService.findOrCreateProfile({
    walletAddress: defaultWallet.address,
    username: user.tag_name,
    displayName: user.display_name,
    avatarUrl: user.profile_picture_url,
    bio: user.about ?? undefined,
  })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { tapestry_profile_id: profile.id },
  })

  return { user: updated, tapestryProfileId: profile.id }
}

export const followUserV2 = async (
  req: Request<{}, {}, FollowUserV2Dto>,
  res: Response,
): Promise<void> => {
  try {
    const followerId = req.user!.id

    const { success, data, error } = await followUserV2Schema.safeParseAsync(
      req.body,
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          data.target_user_id ? { id: data.target_user_id } : undefined,
          data.target_tag_name ? { tag_name: data.target_tag_name } : undefined,
        ].filter(Boolean) as any,
      },
    })

    if (!targetUser) {
      res.status(404).json({
        success: false,
        error: 'Target user not found',
      })
      return
    }

    if (targetUser.id === followerId) {
      res.status(400).json({
        success: false,
        error: 'You cannot follow yourself',
      })
      return
    }

    // Ensure both users have Tapestry profiles
    const [{ tapestryProfileId: followerProfileId }, { tapestryProfileId }] =
      await Promise.all([
        ensureTapestryProfileForUser(followerId),
        ensureTapestryProfileForUser(targetUser.id),
      ])

    // Mirror follow in local DB
    let followEdge: Follower | null = await prisma.follower.findFirst({
      where: {
        user_id: targetUser.id,
        follower_id: followerId,
      },
    })

    if (!followEdge) {
      followEdge = await prisma.follower.create({
        data: {
          user_id: targetUser.id,
          follower_id: followerId,
        },
      })
    }

    // Award points for following
    try {
      await PointsService.awardPoints(followerId, 'USER_FOLLOW', {
        followed_user_id: targetUser.id,
      })
      await PointsService.awardPoints(targetUser.id, 'USER_FOLLOW', {
        follower_user_id: followerId,
      })
    } catch (pointsError) {
      console.error('[followUserV2] Error awarding points:', pointsError)
    }

    // Send notification to the user being followed
    try {
      const followerProfile = await prisma.user.findUnique({
        where: { id: followerId },
        select: { display_name: true, tag_name: true },
      })
      const followerName =
        followerProfile?.display_name || followerProfile?.tag_name || 'Someone'
      const followerTagName = followerProfile?.tag_name || followerId

      await NotificationService.sendNewFollowerNotification(
        targetUser.id,
        followerId,
        followerName,
        followerTagName,
      )
    } catch (notificationError) {
      console.error(
        '[followUserV2] Error sending notification:',
        notificationError,
      )
    }

    // Follow on Tapestry
    await TapestryService.followProfile({
      followerProfileId,
      followeeProfileId: tapestryProfileId,
    })

    res.status(200).json({
      success: true,
      data: {
        follow: followEdge,
      },
    })
  } catch (error: any) {
    console.error('[followUserV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred following the user',
    })
  }
}

export const unfollowUserV2 = async (
  req: Request<{}, {}, FollowUserV2Dto>,
  res: Response,
): Promise<void> => {
  try {
    const followerId = req.user!.id

    const { success, data, error } = await followUserV2Schema.safeParseAsync(
      req.body,
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          data.target_user_id ? { id: data.target_user_id } : undefined,
          data.target_tag_name ? { tag_name: data.target_tag_name } : undefined,
        ].filter(Boolean) as any,
      },
    })

    if (!targetUser) {
      res.status(404).json({
        success: false,
        error: 'Target user not found',
      })
      return
    }

    if (targetUser.id === followerId) {
      res.status(400).json({
        success: false,
        error: 'You cannot unfollow yourself',
      })
      return
    }

    const [{ tapestryProfileId: followerProfileId }, { tapestryProfileId }] =
      await Promise.all([
        ensureTapestryProfileForUser(followerId),
        ensureTapestryProfileForUser(targetUser.id),
      ])

    await prisma.follower.deleteMany({
      where: {
        user_id: targetUser.id,
        follower_id: followerId,
      },
    })

    await TapestryService.unfollowProfile({
      followerProfileId,
      followeeProfileId: tapestryProfileId,
    })

    res.status(200).json({
      success: true,
      data: {
        unfollowed: true,
      },
    })
  } catch (error: any) {
    console.error('[unfollowUserV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred unfollowing the user',
    })
  }
}

export const createPostV2 = async (
  req: Request<{}, {}, CreatePostV2Dto>,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id

    const { success, data, error } = await createPostV2Schema.safeParseAsync(
      req.body,
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    // Map extra metadata into properties for Tapestry
    const properties: { key: string; value: string | number | boolean }[] = [
      { key: 'post_type', value: data.post_type },
    ]

    if (data.post_type === 'DONATION') {
      properties.push(
        { key: 'target_amount', value: (data as any).target_amount },
        { key: 'wallet_address', value: (data as any).wallet_address },
        { key: 'chain_type', value: (data as any).chain_type },
      )
    }

    if (data.post_type === 'TOKEN_CALL') {
      properties.push(
        { key: 'token_name', value: (data as any).token_name },
        { key: 'token_symbol', value: (data as any).token_symbol },
        { key: 'token_address', value: (data as any).token_address },
      )
    }

    // Ensure Tapestry profile exists
    const { tapestryProfileId } = await ensureTapestryProfileForUser(userId)

    // Create content on Tapestry only (no local Post row)
    const content = await TapestryService.findOrCreateContent({
      profileId: tapestryProfileId,
      // Use a Tapestry-native content id; for now we let Tapestry manage identity
      contentId: crypto.randomUUID(),
      properties,
    })

    // Award points for post creation (metadata keyed by Tapestry content id)
    await PointsService.awardPoints(userId, 'POST_CREATION', {
      tapestry_content_id: (content as any).id,
    })

    res.status(201).json({
      success: true,
      data: {
        tapestry_content: content,
      },
    })
  } catch (error: any) {
    console.error('[createPostV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred creating the post',
    })
  }
}

export const createCommentV2 = async (
  req: Request<{}, {}, CreateCommentV2Dto>,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id

    const { success, data, error } = await createCommentV2Schema.safeParseAsync(
      {
        ...req.body,
        user_id: userId,
      },
    )

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    // For v2, treat post_id as the Tapestry content id
    const tapestryContentId = data.post_id

    const { tapestryProfileId } = await ensureTapestryProfileForUser(userId)

    const properties: { key: string; value: string | number | boolean }[] = [
      ...(data.media?.length
        ? [{ key: 'media', value: JSON.stringify(data.media) } as const]
        : []),
      ...(data.properties ?? []),
    ]

    const tapestryComment = await TapestryService.createComment({
      profileId: tapestryProfileId,
      contentId: tapestryContentId,
      text: data.text,
      parentCommentId: (data as any).parent_id,
      properties,
    })

    await PointsService.awardPoints(userId, 'POST_COMMENT', {
      tapestry_content_id: tapestryContentId,
      tapestry_comment_id: (tapestryComment as any).id,
    })

    res.status(201).json({
      success: true,
      data: tapestryComment,
    })
  } catch (error: any) {
    console.error('[createCommentV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred creating the comment',
    })
  }
}

export const likePostV2 = async (
  req: Request<{ post_id: string }, {}, LikePostV2Dto>,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id
    const postId = req.params.post_id || req.body.post_id

    const { success, data, error } = await likePostV2Schema.safeParseAsync({
      post_id: postId,
    })

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    // For v2, treat post_id as the Tapestry content/node id
    const tapestryContentId = data.post_id

    const { tapestryProfileId } = await ensureTapestryProfileForUser(userId)

    await TapestryService.likeNode({
      profileId: tapestryProfileId,
      nodeId: tapestryContentId,
    })

    await PointsService.awardPoints(userId, 'POST_LIKE', {
      tapestry_content_id: tapestryContentId,
    })

    res.status(200).json({
      success: true,
      data: {
        liked: true,
        tapestry_content_id: tapestryContentId,
      },
    })
  } catch (error: any) {
    console.error('[likePostV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred liking the post',
    })
  }
}

export const unlikePostV2 = async (
  req: Request<{ post_id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const postId = req.params.post_id
    if (!postId) {
      res.status(400).json({ success: false, error: 'Post id required' })
      return
    }
    const userId = req.user!.id
    const { tapestryProfileId } = await ensureTapestryProfileForUser(userId)
    await TapestryService.unlikeNode({
      profileId: tapestryProfileId,
      nodeId: postId,
    })
    res.status(200).json({ success: true, unliked: true })
  } catch (error: any) {
    console.error('[unlikePostV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred unliking the post',
    })
  }
}

export const deletePostV2 = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const contentId = req.params.id
    if (!contentId) {
      res.status(400).json({ success: false, error: 'Content id required' })
      return
    }
    await TapestryService.deleteContent(contentId)
    res.status(200).json({ success: true, deleted: true })
  } catch (error: any) {
    console.error('[deletePostV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred deleting the post',
    })
  }
}

export const deleteCommentV2 = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  try {
    const commentId = req.params.id
    if (!commentId) {
      res.status(400).json({ success: false, error: 'Comment id required' })
      return
    }
    await TapestryService.deleteComment(commentId)
    res.status(200).json({ success: true, deleted: true })
  } catch (error: any) {
    console.error('[deleteCommentV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred deleting the comment',
    })
  }
}

export const getSuggestedProfilesV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const identifier =
      (req.query.identifier as string) ||
      (await (async () => {
        const userId = req.user!.id
        const { tapestryProfileId } = await ensureTapestryProfileForUser(userId)
        return tapestryProfileId
      })())
    const result = await TapestryService.getSuggestedProfiles(identifier)
    // SuggestedDetailData is Record<string, { profile: { id, username, bio?, image? }, ... }>
    const list = Object.values(
      (result as Record<
        string,
        {
          profile: {
            id: string
            username: string
            bio?: string | null
            image?: string | null
          }
        }
      >) ?? {},
    )
    const mapped = list.map((item) => ({
      id: item.profile.id,
      username: item.profile.username,
      bio: item.profile.bio,
      image: item.profile.image,
    }))
    res.status(200).json({ success: true, data: { suggested: mapped } })
  } catch (error: any) {
    console.error('[getSuggestedProfilesV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred fetching suggested profiles',
    })
  }
  3
}

export const getActivityFeedV2 = async (
  req: Request<{ username: string }, {}, { page?: string; pageSize?: string }>,
  res: Response,
): Promise<void> => {
  try {
    const username = req.params.username
    if (!username) {
      res.status(400).json({
        success: false,
        error: 'username path parameter is required',
      })
      return
    }

    const page = req.query.page as string | undefined
    const pageSize = req.query.pageSize as string | undefined
    const feed = await TapestryService.getActivityFeed({
      username,
      page,
      pageSize,
    })
    res.status(200).json({ success: true, data: feed })
  } catch (error: any) {
    console.error('[getActivityFeedV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred fetching activity feed',
    })
  }
}

export const getSwapActivityV2 = async (
  req: Request<
    { username: string },
    {},
    { page?: string; pageSize?: string; tokenAddress?: string }
  >,
  res: Response,
): Promise<void> => {
  try {
    const username = req.params.username
    const page = req.query.page as string | undefined
    const pageSize = req.query.pageSize as string | undefined
    const tokenAddress = req.query.tokenAddress as string | undefined
    const result = await TapestryService.getSwapActivity({
      username,
      page,
      pageSize,
      tokenAddress,
    })
    res.status(200).json({ success: true, data: result })
  } catch (error: any) {
    console.error('[getSwapActivityV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred fetching swap activity',
    })
  }
}

export const getGlobalActivityV2 = async (
  req: Request<{}, {}, { page?: string; pageSize?: string }>,
  res: Response,
): Promise<void> => {
  try {
    const page = req.query.page as string | undefined
    const pageSize = req.query.pageSize as string | undefined
    const result = await TapestryService.getGlobalActivity({ page, pageSize })
    res.status(200).json({ success: true, data: result })
  } catch (error: any) {
    console.error('[getGlobalActivityV2] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred fetching global activity',
    })
  }
}
