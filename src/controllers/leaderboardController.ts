import { PointsModel } from '@/models/points.model';
import { GetLeaderboardDto, getLeaderboardDtoSchema } from '@/utils/dto/points.dto';
import { Request, Response } from 'express';

/**
 * Get user points leaderboard
 * Returns a paginated list of top users by points
 */
export const getLeaderboard = async (
  req: Request<{}, {}, {}, GetLeaderboardDto>,
  res: Response
): Promise<void> => {
  try {
    // Parse and validate query parameters
    const { success, data, error } = getLeaderboardDtoSchema.safeParse(req.query);

    if (!success) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // Get leaderboard data from the model
    const leaderboardData = await PointsModel.getLeaderboard(data);

    res.status(200).json({
      success: true,
      data: leaderboardData,
    });
  } catch (error) {
    console.error('[getLeaderboard] Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard data',
    });
  }
};
