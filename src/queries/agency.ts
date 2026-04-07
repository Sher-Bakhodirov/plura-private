'use server'

import { Agency, Plan } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils";

export const getAgencyDetails = async (agencyId: string) => {
  try {
    const agencyDetails = await db.agency.findUnique({
      where: {
        id: agencyId,
      },
      include: {
        subAccount: true,
      },
    });

    if (!agencyDetails) throw new Error("Agency not found");

    return agencyDetails;
  } catch (error) {
    logger(error);
  }
};

export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {
  const response = await db.agency.update({
    where: {
      id: agencyId
    },
    data: {
      ...agencyDetails
    }
  })

  return response
}

export const deleteAgency = async (agencyId: string) => {
  const deletedUserFromDB = await db.agency.delete({
    where: {
      id: agencyId,
    },
    include: {
      subAccount: true,
    },
  });

  return deletedUserFromDB;
};

export const upsertAgency = async (agency: Agency, price?: Plan) => {
  if (!agency.companyEmail) return null;
  try {
    const agencyDetails = await db.agency.upsert({
      where: {
        id: agency.id,
      },
      update: agency,
      create: {
        users: {
          connect: { email: agency.companyEmail },
        },
        ...agency,
        sidebarOption: {
          create: [
            {
              name: "Dashboard",
              icon: "category",
              link: `/agency/${agency.id}`,
            },
            {
              name: "Launchpad",
              icon: "clipboardIcon",
              link: `/agency/${agency.id}/launchpad`,
            },
            {
              name: "Billing",
              icon: "payment",
              link: `/agency/${agency.id}/billing`,
            },
            {
              name: "Settings",
              icon: "settings",
              link: `/agency/${agency.id}/settings`,
            },
            {
              name: "Sub Accounts",
              icon: "person",
              link: `/agency/${agency.id}/all-subaccounts`,
            },
            {
              name: "Team",
              icon: "shield",
              link: `/agency/${agency.id}/team`,
            },
          ],
        },
      },
    });

    return agencyDetails;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// export const getAgencySubscription = async (agencyId: string) => {
//   const agencySubscription = await db.agency.findUnique({
//     where: {
//       id: agencyId,
//     },
//     select: {
//       customerId: true,
//       subscriptions: true,
//     },
//   });

//   return agencySubscription;
// };

// export const updateAgencyConnectedId = async (
//   agencyId: string,
//   connectAccountId: string
// ) => {
//   const response = await db.agency.update({
//     where: {
//       id: agencyId,
//     },
//     data: {
//       connectAccountId,
//     },
//   });

//   return response;
// };