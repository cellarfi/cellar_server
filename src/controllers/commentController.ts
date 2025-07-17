import { CommentModel } from '@/models/comment.model'
import { createCommentDto, createCommentSchema } from '@/utils/dto/socialfi.dto'
import { Request, Response } from 'express'

export const createComment = async (
  req: Request<{}, {}, createCommentDto>,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!
    const user_id = user.id

    const { success, data, error } = await createCommentSchema.safeParseAsync({
      ...req.body,
      user_id: user_id,
    })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }
    const comment = await CommentModel.createComment(data)
    res.status(201).json({
      success: true,
      data: comment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred creating the comment.',
    })
  }
}

export const deleteComment = async (
  req: Request<{}, {}, { id: string; post_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const user = req.user!
    const user_id = user.id
    const id = req.body.id
    const post = req.body.post_id

    if (id && post == null) {
      res.status(400).json({
        success: false,
        error: 'Comment ID and Post ID missing in body',
      })
      return
    }

    const deleteFunction = await CommentModel.deleteComment({
      user_id: user_id,
      id: id,
      post_id: post,
    })

    res.status(200).json({
      success: true,
      data: deleteFunction,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred deleting the comment.',
    })
  }
}
