import AgencyDetails from "@/components/forms/agency-details";
import { Plan } from "@/generated/prisma/enums";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function UnAuthorized() {
  return <div>Not authorized</div>
}

function CreateAgencyForm() {

}

interface AgencyPageSearchProps {
  searchParams: {
    plan: Plan,
    state: string,
    code: string
  }
}

export default async function AgencyPage({ searchParams: { plan, state, code } }: AgencyPageSearchProps) {
  const agencyId = await verifyAndAcceptInvitation()
  const user = await getAuthUserDetails();

  if (!agencyId || !user) {
    return <UnAuthorized />
  }

  const isSubAccountUser = user.role === 'SUBACCOUNT_GUEST' || user.role === 'SUBACCOUNT_USER';
  const isAgencyUser = user.role === 'AGENCY_OWNER' || user.role === 'AGENCY_ADMIN'

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

  const authUser = await currentUser()

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Create An Agency</h1>

        <AgencyDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }} />
      </div>
    </div>
  )
}

