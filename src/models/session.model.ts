import {
  CreateSessionDto,
  SessionQueryDto,
  UpdateSessionDto,
} from '@/utils/dto/session.dto'
import { DeviceStatus } from '../../generated/prisma'
import prismaService from '../service/prismaService'

const prisma = prismaService.prisma

export class SessionModel {
  /**
   * Create a new session for a user and device
   */
  static async createSession(dto: CreateSessionDto) {
    return prisma.session.create({
      data: {
        user_id: dto.user_id,
        device_id: dto.device_id,
        expo_push_token: dto.expo_push_token,
        platform: dto.platform,
        device_name: dto.device_name,
        os_version: dto.os_version,
        app_version: dto.app_version,
        device_model: dto.device_model,
        agent: dto.agent,
        ip_address: dto.ip_address,
        country: dto.country,
        city: dto.city,
        status: dto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }

  /**
   * Update an existing session
   */
  static async updateSession(dto: UpdateSessionDto) {
    const { session_id, ...updateData } = dto

    return prisma.session.update({
      where: { id: session_id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string) {
    return prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }

  /**
   * Get session by device ID
   */
  static async getSessionByDeviceId(deviceId: string) {
    return prisma.session.findUnique({
      where: { device_id: deviceId },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
      },
    })
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(query: SessionQueryDto) {
    const whereClause: any = {
      user_id: query.user_id,
    }

    if (query.device_id) {
      whereClause.device_id = query.device_id
    }

    if (query.status) {
      whereClause.status = query.status
    }

    return prisma.session.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            tag_name: true,
            email: true,
            profile_picture_url: true,
          },
        },
      },
      orderBy: {
        last_seen_at: 'desc',
      },
    })
  }

  /**
   * Sign out a specific session (set status to SIGNED_OUT)
   */
  static async signOutSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: {
        status: DeviceStatus.SIGNED_OUT,
      },
    })
  }

  /**
   * Sign out all sessions for a user except the current one
   */
  static async signOutAllOtherSessions(
    userId: string,
    currentSessionId: string
  ) {
    const result = await prisma.session.updateMany({
      where: {
        user_id: userId,
        id: { not: currentSessionId },
        status: DeviceStatus.ACTIVE,
      },
      data: {
        status: DeviceStatus.SIGNED_OUT,
      },
    })

    return { success: true, message: `Signed out ${result.count} sessions` }
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: {
        status: DeviceStatus.REVOKED,
      },
    })
  }

  /**
   * Update last seen timestamp for a session
   */
  static async updateLastSeen(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: {
        last_seen_at: new Date(),
      },
    })
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string) {
    return prisma.session.delete({
      where: { id: sessionId },
    })
  }

  /**
   * Get active sessions count for a user
   */
  static async getActiveSessionsCount(userId: string) {
    return prisma.session.count({
      where: {
        user_id: userId,
        status: DeviceStatus.ACTIVE,
      },
    })
  }

  /**
   * Clean up old sessions (older than specified days)
   */
  static async cleanupOldSessions(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.session.deleteMany({
      where: {
        last_seen_at: {
          lt: cutoffDate,
        },
        status: {
          in: [DeviceStatus.SIGNED_OUT, DeviceStatus.REVOKED],
        },
      },
    })

    return { cleanedUp: result.count }
  }
}
