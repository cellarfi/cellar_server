import { z } from 'zod';
import { isValidSolanaAddress } from '../solana.util';

export const createUserSchema = z.object({
  user_id: z.string().refine(isValidSolanaAddress, {
    message: 'Invalid wallet address',
  }),
  username: z.string().min(3).max(20),
  profile_picture_url: z.string().optional(),
  about: z.string().optional(),
  created_at: z.date().default(() => new Date()),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
  .partial()
  .omit({
    created_at: true,
  })
  .required({
    user_id: true,
  })
  .refine(
    (data) => {
      if (!data.username && !data.profile_picture_url && !data.about) {
        return false;
      }
      return true;
    },
    {
      message: 'At least one field must be provided for update',
    }
  );
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
