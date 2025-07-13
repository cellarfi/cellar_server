import { z } from 'zod'

export const createPost = z.object({
  message: z.string(),
  owner_id: z.string(),
  trends: z.array(z.any())
})

export const addLike = z.object({
    postId: z.string(),
    userId: z.string()
})

export const createComment = z.object({
   postId: z.string(),
   text: z.string(),
   userId: z.string()
})

export const deleteLike = z.object({
    id: z.string(),
    postId: z.string(),
    userId: z.string()
})

export const deleteComment = z.object({
    id: z.string(),
    postId: z.string(),
    userId: z.string()
})

export const tipUser = z.object({
    postId: z.string(),
    amount: z.number()
})

export type CreatePostDto = z.infer<typeof createPost>
export type addLikeDto = z.infer<typeof addLike> 
export type createCommentDto = z.infer<typeof createComment>
export type deleteLikeDto = z.infer<typeof deleteLike>
export type deleteCommentDto = z.infer<typeof deleteComment>
export type tipUserDto = z.infer<typeof tipUser>