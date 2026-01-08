import { ProfileClient } from "./ProfileClient";

interface ProfilePageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { tenantSlug } = await params;

  return <ProfileClient tenantSlug={tenantSlug} />;
}
