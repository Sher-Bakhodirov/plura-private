import Sidebar from "@/components/sidebar";
import UnAuthorized from "@/components/unauthorized";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { getNotificationsAndUser } from "@/queries/notifications";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface AgencyLayoutProps {
  children: React.ReactNode,
  params: { agencyId: string }
}

export default async function AgencyLayout({ children, params }: AgencyLayoutProps) {
  const { agencyId: agencyIdFromParams } = await params;
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) redirect('/');
  if (!agencyId) redirect('/agency');

  if (
    user.privateMetadata.role !== 'AGENCY_OWNER' &&
    user.privateMetadata.role !== 'AGENCY_ADMIN'
  ) {
    return <UnAuthorized />
  }

  let allNotifications: any = [];

  const notifications = await getNotificationsAndUser(agencyId);
  if (notifications) {
    allNotifications = notifications;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={agencyIdFromParams} type='agency' />
      <div className="md:pl=[300px]">{children}</div>
    </div>
  )

}