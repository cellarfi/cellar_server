import prismaService from '@/service/prismaService';
import {
  CreatePointDto,
  GetPointHistoryDto,
  UpdateUserPointDto,
} from '@/utils/dto/points.dto';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = prismaService.prisma;

export class PointsModel {
  /**
   * Create a new point transaction and update user point balance
   * @param dto CreatePointDto with user_id, amount, action, source, and optional metadata
   */
  static async createPoint(dto: CreatePointDto) {
    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Create the point transaction
      const point = await tx.point.create({
        data: {
          user_id: dto.user_id,
          amount: new Decimal(dto.amount),
          action: dto.action,
          source: dto.source,
          metadata: dto.metadata || {},
        },
      });

      // Get or create user point record
      let userPoint = await tx.userPoint.findUnique({
        where: {
          user_id: dto.user_id,
        },
      });

      const pointAmount = new Decimal(dto.amount);

      // Calculate new balance based on action
      const balanceChange =
        dto.action === 'increment' ? pointAmount : pointAmount.negated();

      // If user point record exists, update it
      if (userPoint) {
        userPoint = await tx.userPoint.update({
          where: {
            user_id: dto.user_id,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
            // Update level based on new balance
            level: this.calculateLevel(userPoint.balance.add(balanceChange)),
          },
        });
      } else {
        // Create new user point record if it doesn't exist
        userPoint = await tx.userPoint.create({
          data: {
            user_id: dto.user_id,
            balance: balanceChange,
            level: this.calculateLevel(balanceChange),
          },
        });
      }

      return { point, userPoint };
    });
  }

  /**
   * Get user point balance and details
   * @param user_id User ID to get points for
   */
  static async getUserPoints(user_id: string) {
    return await prisma.userPoint.findUnique({
      where: {
        user_id,
      },
    });
  }

  /**
   * Update user point details directly (use with caution)
   * @param dto UpdateUserPointDto with user_id and optional balance and level
   */
  static async updateUserPoints(dto: UpdateUserPointDto) {
    const { user_id, ...updateData } = dto;

    // Convert string balance to Decimal if needed
    if (updateData.balance && typeof updateData.balance === 'string') {
      updateData.balance = new Decimal(updateData.balance).toNumber();
    }

    return await prisma.userPoint.upsert({
      where: {
        user_id,
      },
      update: updateData,
      create: {
        user_id,
        balance: updateData.balance
          ? new Decimal(updateData.balance)
          : new Decimal(0),
        level: updateData.level || 1,
      },
    });
  }

  /**
   * Get user point history with optional filters
   * @param dto GetPointHistoryDto with filters
   */
  static async getPointHistory(dto: GetPointHistoryDto) {
    const {
      user_id,
      source,
      start_date,
      end_date,
      limit = 20,
      offset = 0,
    } = dto;

    // Build where clause based on provided filters
    const whereClause: any = {
      user_id,
    };

    if (source) {
      whereClause.source = source;
    }

    // Add date range filter if provided
    if (start_date || end_date) {
      whereClause.created_at = {};

      if (start_date) {
        whereClause.created_at.gte = start_date;
      }

      if (end_date) {
        whereClause.created_at.lte = end_date;
      }
    }

    // Get point history with pagination
    const points = await prisma.point.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await prisma.point.count({
      where: whereClause,
    });

    return {
      points,
      pagination: {
        total: totalCount,
        offset,
        limit,
      },
    };
  }

  /**
   * Calculate level based on point balance
   * This is a utility function that can be used to determine level
   * @param balance Current balance
   * @returns Appropriate level
   */
  static calculateLevel(balance: number | string | Decimal): number {
    // Convert balance to number for comparison
    const balanceNum =
      typeof balance === 'object'
        ? parseFloat(balance.toString())
        : typeof balance === 'string'
        ? parseFloat(balance)
        : balance;

    // Example level calculation logic - can be adjusted based on requirements
    if (balanceNum < 100) return 1;
    if (balanceNum < 500) return 2;
    if (balanceNum < 1000) return 3;
    if (balanceNum < 2500) return 4;
    if (balanceNum < 5000) return 5;
    if (balanceNum < 10000) return 6;
    if (balanceNum < 25000) return 7;
    if (balanceNum < 50000) return 8;
    if (balanceNum < 100000) return 9;
    return 10; // Maximum level
  }
}
