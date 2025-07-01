import { UsersService } from '@/service/usersService';
import {
  CreateUserDto,
  createUserSchema,
  UpdateUserDto,
  updateUserSchema,
} from '@/utils/dto/users.dto';
import { Request, Response } from 'express';

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const walletAddress = req.user!.wallet!.address;

    const user = await UsersService.getUserById(walletAddress);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    console.error('[getProfile] Error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving the user profile',
    });
  }
};

export const createUser = async (
  req: Request<{}, {}, CreateUserDto>,
  res: Response
): Promise<void> => {
  try {
    const walletAddress = req.user!.wallet!.address;

    const { success, data, error } = await createUserSchema.safeParseAsync({
      ...req.body,
      user_id: walletAddress,
    });
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    const user = await UsersService.createUser(data);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'User already exists',
      });
      return;
    }

    console.error('[createUser] Error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred creating the user',
    });
  }
};

export const updateProfile = async (
  req: Request<{}, {}, UpdateUserDto>,
  res: Response
): Promise<void> => {
  try {
    const walletAddress = req.user!.wallet!.address;
    const { success, data, error } = await updateUserSchema.safeParseAsync({
      ...req.body,
      user_id: walletAddress,
    });
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    const updatedUser = await UsersService.updateUser({
      ...data,
      user_id: walletAddress,
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err: any) {
    console.error('[updateProfile] Error:', err);
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "An error occurred updating the user's profile",
    });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const walletAddress = req.user!.wallet!.address;
    const { success, data, error } = await updateUserSchema.safeParseAsync({
      ...req.body,
      user_id: walletAddress,
    });
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    await UsersService.deleteUser(walletAddress);

    res.status(204);
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    console.error('[deleteUser] Error:', err);
    res.status(500).json({
      success: false,
      error: "An error occurred deleting the user's account",
    });
  }
};
