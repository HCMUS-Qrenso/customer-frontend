import { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";

interface ProfilePageProps {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { tenantSlug } = await params;

  return {
    title: `Profile | ${tenantSlug}`,
    description: "Manage your profile and account settings",
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { tenantSlug } = await params;

  return <ProfileClient tenantSlug={tenantSlug} />;
}
