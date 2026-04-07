'use server'
import { db } from "@/lib/db";
import { logger } from "@/lib/utils";

export const getNotificationsAndUser = async (agencyId: string) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      include: { user: true },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return response
  } catch (error) {
    logger(error)
  }
}