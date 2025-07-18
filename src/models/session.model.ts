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
  static async getSessionById(session_id: string) {
    return prisma.session.findUnique({
      where: { id: session_id },
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
  static async getSessionByDeviceId(device_id: string) {
    return prisma.session.findUnique({
      where: { device_id },
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
  static async signOutSession(session_id: string) {
    return prisma.session.update({
      where: { id: session_id },
      data: {
        status: DeviceStatus.SIGNED_OUT,
      },
    })
  }

  /**
   * Sign out all sessions for a user except the current one
   */
  static async signOutAllOtherSessions(
    user_id: string,
    current_session_id: string
  ) {
    const result = await prisma.session.updateMany({
      where: {
        user_id,
        id: { not: current_session_id },
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
  static async revokeSession(session_id: string) {
    return prisma.session.update({
      where: { id: session_id },
      data: {
        status: DeviceStatus.REVOKED,
      },
    })
  }

  /**
   * Update last seen timestamp for a session
   */
  static async updateLastSeen(session_id: string) {
    return prisma.session.update({
      where: { id: session_id },
      data: {
        last_seen_at: new Date(),
      },
    })
  }

  /**
   * Delete a session
   */
  static async deleteSession(session_id: string) {
    return prisma.session.delete({
      where: { id: session_id },
    })
  }

  /**
   * Get active sessions count for a user
   */
  static async getActiveSessionsCount(user_id: string) {
    return prisma.session.count({
      where: {
        user_id,
        status: DeviceStatus.ACTIVE,
      },
    })
  }

  /**
   * Clean up old sessions (older than specified days)
   */
  static async cleanupOldSessions(days_old: number = 30) {
    const cutoff_date = new Date()
    cutoff_date.setDate(cutoff_date.getDate() - days_old)

    const result = await prisma.session.deleteMany({
      where: {
        last_seen_at: {
          lt: cutoff_date,
        },
        status: {
          in: [DeviceStatus.SIGNED_OUT, DeviceStatus.REVOKED],
        },
      },
    })

    return { cleanedUp: result.count }
  }
}
