import AgencyDetails from "@/components/forms/agency-details";
import { Plan } from "@/generated/prisma/enums";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function UnAuthorized() {
  return <div>Not authorized</div>
}

interface AgencyPageSearchProps {
  searchParams: Promise<{
    plan: Plan,
    state: string,
    code: string
  }>
}

export default async function AgencyPage({ searchParams }: AgencyPageSearchProps) {
  const { plan, state, code } = await searchParams
  const agencyId = await verifyAndAcceptInvitation()
  const user = await getAuthUserDetails();

  if (!agencyId) {
    const authUser = await currentUser()

    return (
      <div className="flex w-full justify-center items-center mt-4 px-4 py-10">
        <div className="flex w-full max-w-[850px] flex-col gap-8">
          <h1 className="text-4xl">Create An Agency</h1>
          <AgencyDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }} />
        </div>
      </div>
    )
  }

  const isSubAccountUser = user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER';
  const isAgencyUser = user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN'

  if (isSubAccountUser) {
    return redirect('/subaccount')
  } else if (isAgencyUser) {
    if (plan) {
      return redirect(`/agency/${agencyId}/billing?plan=${plan}`)
    }

    if (!state) {
      return redirect(`/agency/${agencyId}`)
    }

    const statePath = state.split('___')[0]
    const stateAgencyId = state.split('___')[1]

    if (!stateAgencyId) return <UnAuthorized />

    return redirect(`/agency/${stateAgencyId}/${statePath}?code=${code}`)
  }
}

