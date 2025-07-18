import { PointsModel } from '@/models/points.model';
import {
  GetPointHistoryDto,
  getPointHistoryDtoSchema,
} from '@/utils/dto/points.dto';
import { Request, Response } from 'express';

/**
 * Get point balance and details for a user
 */
export const getUserPoints = async (
  req: Request<{ user_id?: string }, {}, {}, {}>,
  res: Response
): Promise<void> => {
  try {
    // Use the requested user_id if provided, otherwise use the authenticated user's ID
    const user_id = req.params.user_id || req.user?.id;

    if (!user_id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    const userPoints = await PointsModel.getUserPoints(user_id);

    if (!userPoints) {
      // Return default values if no user points record exists yet
      res.json({
        success: true,
        data: {
          user_id,
          balance: 0,
          level: 1,
          created_at: null,
          updated_at: null,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: userPoints,
    });
  } catch (err: any) {
    console.error('[getUserPoints] Error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving user points',
    });
  }
};

/**
 * Get point history for a user with filters
 */
export const getPointHistory = async (
  req: Request<{ user_id?: string }, {}, {}, any>,
  res: Response
): Promise<void> => {
  try {
    // Use the requested user_id if provided in params, otherwise use query param, finally use authenticated user
    const user_id = req.params.user_id || req.query.user_id || req.user?.id;

    if (!user_id) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    // Build request data from params and query
    const queryData: GetPointHistoryDto = {
      user_id,
      source: req.query.source as string | undefined,
      start_date: req.query.start_date
        ? new Date(req.query.start_date as string)
        : undefined,
      end_date: req.query.end_date
        ? new Date(req.query.end_date as string)
        : undefined,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };

    const { success, data, error } =
      await getPointHistoryDtoSchema.safeParseAsync(queryData);
    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    const history = await PointsModel.getPointHistory(data);

    res.json({
      success: true,
      data: history.points,
      pagination: history.pagination,
    });
  } catch (err: any) {
    console.error('[getPointHistory] Error:', err);
    res.status(500).json({
      success: false,
      error: 'An error occurred retrieving point history',
    });
  }
};
