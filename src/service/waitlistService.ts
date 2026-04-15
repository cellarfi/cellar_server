import prismaService from '@/service/prismaService'

const prisma = prismaService.prisma

export interface WaitlistStats {
  totalWaitlists: number
  joinedToday: number
  newestJoinAt: Date | null
  oldestJoinAt: Date | null
}

export class WaitlistService {
  static async joinWaitlist(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    return prisma.pilaWaitlist.create({
      data: {
        email: normalizedEmail,
      },
    })
  }

  static async getAllWaitlistEmails(): Promise<string[]> {
    const rows = await prisma.pilaWaitlist.findMany({
      select: { email: true },
      orderBy: { created_at: 'desc' },
    })
    return rows.map((row) => row.email)
  }

  static async getWaitlistStats(): Promise<WaitlistStats> {
    const [totalWaitlists, newest, oldest] = await Promise.all([
      prisma.pilaWaitlist.count(),
      prisma.pilaWaitlist.findFirst({
        orderBy: { created_at: 'desc' },
        select: { created_at: true },
      }),
      prisma.pilaWaitlist.findFirst({
        orderBy: { created_at: 'asc' },
        select: { created_at: true },
      }),
    ])

    const startOfTodayUtc = new Date()
    startOfTodayUtc.setUTCHours(0, 0, 0, 0)

    const joinedToday = await prisma.pilaWaitlist.count({
      where: {
        created_at: {
          gte: startOfTodayUtc,
        },
      },
    })

    return {
      totalWaitlists,
      joinedToday,
      newestJoinAt: newest?.created_at ?? null,
      oldestJoinAt: oldest?.created_at ?? null,
    }
  }
}
