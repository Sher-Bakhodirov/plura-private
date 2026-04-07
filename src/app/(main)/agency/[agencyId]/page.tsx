export default async function AgencyPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;

  return <div>AgencyPage {agencyId}</div>
}