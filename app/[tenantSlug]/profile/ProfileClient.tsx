"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";

interface ProfileClientProps {
  tenantSlug: string;
}

function ProfileContent({ tenantSlug }: ProfileClientProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    console.log(
      "ProfileClient: isAuthenticated =",
      isAuthenticated,
      "user =",
      user,
    );
    // Simple check: if not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log("Redirecting to menu because not authenticated");
      router.push(`/${tenantSlug}/menu`);
    }
  }, [isAuthenticated, router, tenantSlug]);

  // Show loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const menuHref = `/${tenantSlug}/menu`;

  return (
    <div className="min-h-screen bg-slate-50 pb-8 dark:bg-slate-900">
      <PageHeader
        title={t.auth.profile}
        subtitle={tenantSlug}
        backHref={menuHref}
        rightContent={<UserAvatar />}
        maxWidth="7xl"
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Suspense fallback={<div>{t.cta.loading}</div>}>
          <ProfileForm />
        </Suspense>
      </div>
    </div>
  );
}

export function ProfileClient({ tenantSlug }: ProfileClientProps) {
  return (
    <LanguageProvider>
      <ProfileContent tenantSlug={tenantSlug} />
    </LanguageProvider>
  );
}
