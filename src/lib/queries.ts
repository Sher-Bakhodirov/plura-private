'use server'

import { User } from "@/generated/prisma/client";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "./db";
import { logger } from "./utils";

export const getAuthUserDetails = async () => {
  const user = await currentUser()
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: {
      agency: {
        include: {
          sidebarOption: true,
          subAccount: {
            include: {
              sidebarOption: true
            }
          }
        }
      },
      Permissions: true
    }
  })

  return userData
}

export const saveActivityLogsNotification = async ({
  agencyId, description, subaccountId,
}: {
  agencyId?: string,
  description: string,
  subaccountId?: string,
}) => {
  const authUser = await currentUser();

  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        agency: {
          subAccount: {
            some: {
              id: subaccountId
            }
          }
        }
      }
    })

    if (response) {
      userData = response
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser?.emailAddresses[0].emailAddress
      }
    })

    if (!userData) {
      // TODO: Logger
      console.log('Could not find a user')
      return;
    }

    let foundAgencyId = agencyId;
    if (!foundAgencyId) {
      if (!subaccountId) {
        throw new Error(
          'You Need to provide at least an agency Id or subaccount Id'
        )
      }

      const response = await db.subAccount.findUnique({
        where: {
          id: subaccountId
        }
      })

      if (response) {
        foundAgencyId = response.agencyId
      }
    }

    if (subaccountId) {
      await db.notification.create({
        data: {
          notification: `${userData.name} | ${description}`,
          user: {
            connect: {
              id: userData.id
            }
          },
          agency: {
            connect: {
              id: foundAgencyId,
            }
          },
          subAccount: {
            connect: {
              id: subaccountId
            }
          }
        }
      })
    } else {
      await db.notification.create({
        data: {
          notification: `${userData.name} | ${description}`,
          user: {
            connect: {
              id: userData.id,
            }
          },
          agency: {
            connect: {
              id: foundAgencyId
            }
          }
        }
      })
    }

  }
}

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === 'AGENCY_OWNER') return null;
  const response = await db.user.create({ data: { ...user } })
  return response
}

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in')
  }

  const invite = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: 'PENDING'
    }
  })

  if (invite) {
    const userDetails = await createTeamUser(invite.agencyId, {
      email: invite.email,
      agencyId: invite.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invite.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await saveActivityLogsNotification({
      agencyId: invite.agencyId,
      description: `${user.firstName} ${user.lastName} Joined`,
      subaccountId: undefined
    })

    if (userDetails) {
      const client = await clerkClient()
      await client.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER"
        }
      })

      await db.invitation.delete({
        where: { email: userDetails.email }
      })

      return userDetails.agencyId
    } else {
      return null
    }
  } else {
    const existingUser = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress
      }
    })

    return existingUser ? existingUser.agencyId : null
  }
}

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;

  const userData = await db.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || 'SUBACCOUNT_USER',
    }
  })

  const client = await clerkClient()

  client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: userData.role || "SUBACCOUNT_USER"
    }
  })

  return userData
}