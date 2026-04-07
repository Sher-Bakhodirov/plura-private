import { getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

interface SidebarProps {
  id: string;
  type: "agency" | "subaccount";
}

export default async function Sidebar({ id, type }: SidebarProps) {
  const user = await getAuthUserDetails()

  if (!user || !user.agency) {
    return null;
  }

  const isAgency = type === 'agency';
  const isSubAccount = type === 'subaccount';
  const agency = user.agency;
  const subAccount = user.agency.subAccount.find((subAccount) => subAccount.id === id);
  const isWhiteLabeledAgency = agency.whiteLabel;
  const details = isAgency ? agency : subAccount;

  if (!details) return;

  let sidebarLogo = user.agency.agencyLogo || '/assets/plura-logo';

  if (!isWhiteLabeledAgency && isSubAccount) {
    sidebarLogo = subAccount?.subAccountLogo || agency.agencyLogo || '/assets/plura-logo'
  }

  const sidebarOption = isAgency ? agency.sidebarOption : subAccount?.sidebarOption || [];
  const permissedSubAccountIds = user.Permissions
    .filter(permission => permission.access)
    .map(permission => permission.subAccountId);

  const subAccounts = agency.subAccount.filter(subAccount => permissedSubAccountIds.includes(subAccount.id))

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOption}
        subAccounts={subAccounts}
        user={user}
      />

      <MenuOptions
        defaultOpen={false}
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOption}
        subAccounts={subAccounts}
        user={user}
      />

    </>
  )
}