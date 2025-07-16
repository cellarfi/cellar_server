import { ERROR_MESSAGES } from '@/constants/app.constants'
import { UsersModel } from '@/models/user.model'
import { parseUserInclude, UserIncludeQuery } from '@/types/include.types'
import {
  CreateUserDto,
  createUserSchema,
  CreateUserWalletDto,
  createUserWalletSchema,
  UpdateUserDefaultWalletDto,
  updateUserDefaultWalletSchema,
  UpdateUserDto,
  updateUserSchema,
} from '@/utils/dto/users.dto'
import { Request, Response } from 'express'

export const getProfile = async (
  req: Request<{}, {}, {}, UserIncludeQuery>,
  res: Response
): Promise<void> => {
  try {
    const user_id = req.user!.id

    // Parse include parameters from query string
    const includeParams = parseUserInclude(req.query)

    const user = await UsersModel.getUserById(user_id, includeParams)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (err: any) {
    console.error('[getProfile] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving the user profile',
    })
  }
}

export const getUserByTagName = async (
  req: Request<{ tag_name: string }, {}, {}, UserIncludeQuery>,
  res: Response
): Promise<void> => {
  try {
    const tag_name = req.params.tag_name
    if (!tag_name) {
      res.status(400).json({
        success: false,
        error: 'Tag name is required',
      })
      return
    }

    // Parse include parameters from query string
    const includeParams = parseUserInclude(req.query)

    const user = await UsersModel.getUserByTagName(tag_name, includeParams)
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (err: any) {
    console.error('[getUserByTagName] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving the user by tag name',
    })
  }
}

export const checkIfTagNameExists = async (
  req: Request<{ tag_name: string }>,
  res: Response
): Promise<void> => {
  try {
    const tag_name = req.params.tag_name
    if (!tag_name) {
      res.status(400).json({
        success: false,
        error: 'Tag name is required',
      })
      return
    }

    const user = await UsersModel.getUserByTagName(tag_name)
    res.json({
      success: true,
      exists: !!user,
    })
  } catch (err: any) {
    console.error('[tagNameExists] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred',
    })
  }
}

export const createUser = async (
  req: Request<{}, {}, CreateUserDto>,
  res: Response
): Promise<void> => {
  try {
    const id = req.user!.id
    if (!req.body.referred_by) delete req.body.referred_by

    const { success, data, error } = await createUserSchema.safeParseAsync({
      ...req.body,
      id,
      created_at:
        req.user?.createdAt?.toISOString() || new Date().toISOString(),
    })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const user = await UsersModel.createUser(data)
    const wallet = await UsersModel.createUserWallet({
      user_id: user.id,
      chain_type: req.user!.wallet!.chainType,
      address: req.user!.wallet!.address,
      is_default: true,
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          ...user,
          wallet,
        },
      },
    })
  } catch (err: any) {
    if (err.code === 'P2002') {
      console.log(err)
      res.status(409).json({
        success: false,
        error: 'User already exists',
      })
      return
    }

    if (err.code === 'P2003') {
      console.log('err.code', err)
      if (err?.meta?.constraint === 'users_referred_by_fkey') {
        res.status(409).json({
          success: false,
          error: 'Referral code is invalid',
        })
        return
      }

      return
    }

    console.error('[createUser] Error:', err)
    res.status(500).json({
      success: false,
      error: 'An error occurred creating the user',
    })
  }
}

export const createUserWallet = async (
  req: Request<{}, {}, CreateUserWalletDto>,
  res: Response
): Promise<void> => {
  try {
    const { success, data, error } =
      await createUserWalletSchema.safeParseAsync({
        ...req.body,
      })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const wallet = await UsersModel.createUserWallet(data)

    res.status(201).json({
      success: true,
      data: wallet,
    })
  } catch (err: any) {
    console.error('[createUserWallet] Error:', err)
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'User wallet already exists',
      })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred creating the user wallet',
    })
  }
}

export const updateUserDefaultWallet = async (
  req: Request<{}, {}, UpdateUserDefaultWalletDto>,
  res: Response
): Promise<void> => {
  try {
    const id = req.user!.id

    const { success, data, error } =
      await updateUserDefaultWalletSchema.safeParseAsync({
        ...req.body,
        user_id: id,
      })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const wallet = await UsersModel.updateUserDefaultWallet(data)

    res.status(201).json({
      success: true,
      data: wallet,
    })
  } catch (err: any) {
    console.error('[updateUserDefaultWallet] Error:', err)
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User or wallet not found',
      })
      return
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred updating the user default wallet',
    })
  }
}

export const updateProfile = async (
  req: Request<{}, {}, UpdateUserDto>,
  res: Response
): Promise<void> => {
  try {
    const id = req.user!.id
    const { success, data, error } = await updateUserSchema.safeParseAsync({
      ...req.body,
      user_id: id,
    })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    const updatedUser = await UsersModel.updateUser(id, {
      ...data,
    })

    res.json({
      success: true,
      data: updatedUser,
    })
  } catch (err: any) {
    console.error('[updateProfile] Error:', err)

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    // Handle tag name update time limit error
    if (
      err.message &&
      err.message.includes(ERROR_MESSAGES.TAG_NAME_UPDATE_LIMIT)
    ) {
      res.status(400).json({
        success: false,
        error: err.message,
      })
      return
    }

    res.status(500).json({
      success: false,
      error: "An error occurred updating the user's profile",
    })
  }
}

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const walletAddress = req.user!.wallet!.address
    const { success, data, error } = await updateUserSchema.safeParseAsync({
      ...req.body,
      user_id: walletAddress,
    })
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
      return
    }

    await UsersModel.deleteUser(walletAddress)

    res.status(204)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    console.error('[deleteUser] Error:', err)
    res.status(500).json({
      success: false,
      error: "An error occurred deleting the user's account",
    })
  }
}

export const searchUsers = async (
  req: Request<{}, {}, {}, { query: string }>,
  res: Response
): Promise<void> => {
  try {
    const query = req.query.query

    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Search query is required',
      })
      return
    }

    const users = await UsersModel.searchUser(query)

    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'An error occurred searching for users.',
    })
  }
}

export const getUserProfile = async (
  req: Request<{ tag_name: string }, {}, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    const user_id = req.user!.id
    const { tag_name } = req.params

    if (!tag_name) {
      res.status(400).json({
        success: false,
        error: 'ID query is required',
      })
      return
    }

    const data = await UsersModel.getUserProfile(tag_name, user_id)

    res.status(200).json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error('[getUserProfile] Error:', error)
    res.status(500).json({
      success: false,
      error: 'An error occurred getting the user profile',
    })
  }
}
