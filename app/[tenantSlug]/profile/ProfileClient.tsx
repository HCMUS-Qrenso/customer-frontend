"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useAuth } from "@/hooks/use-auth";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";

interface ProfileClientProps {
  tenantSlug: string;
}

function ProfileContent({ tenantSlug }: ProfileClientProps) {
  const { isAuthenticated, isInitialized, user } = useAuth({
    requireAuth: true,
    loginUrl: `/auth/login`,
  });
  const { t } = useLanguage();

  // Show loading while auth initializes
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Show loading while user data loads (after auth check)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
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
