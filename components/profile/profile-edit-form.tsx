"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { AuthUser } from "@/lib/stores/auth-store";
import type { UpdateProfilePayload } from "@/lib/customer/profile";

interface ProfileEditFormProps {
  profile: AuthUser;
  formData: Partial<AuthUser>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<AuthUser>>>;
  setHasChanges: (hasChanges: boolean) => void;
  onSave: () => void;
  isPending: boolean;
  hasChanges: boolean;
}

export function ProfileEditForm({
  profile,
  formData,
  setFormData,
  setHasChanges,
  onSave,
  isPending,
  hasChanges,
}: ProfileEditFormProps) {
  const { t } = useLanguage();
  const originalDataRef = useRef<Partial<AuthUser>>({});

  // Store original data when profile changes
  useEffect(() => {
    originalDataRef.current = {
      fullName: profile.fullName,
      phone: profile.phone,
    };
  }, [profile]);

  // Check if there are actual changes
  const checkForChanges = useCallback(() => {
    const original = originalDataRef.current;
    const hasFullNameChanged =
      (formData.fullName || "") !== (original.fullName || "");
    const hasPhoneChanged = (formData.phone || "") !== (original.phone || "");
    return hasFullNameChanged || hasPhoneChanged;
  }, [formData]);

  // Update hasChanges whenever formData changes
  useEffect(() => {
    setHasChanges(checkForChanges());
  }, [checkForChanges, setHasChanges]);

  const handleInputChange = useCallback(
    (field: keyof UpdateProfilePayload, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [setFormData],
  );

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-xl p-5 lg:col-span-2",
      )}
    >
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5" />
          {t.profile.personalInfo}
        </h3>
      </div>
      <div className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">{t.profile.fullName}</Label>
          <Input
            id="fullName"
            value={formData.fullName || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder={t.profile.fullNamePlaceholder}
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t.profile.phone}</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder={t.profile.phonePlaceholder}
          />
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">{t.profile.email}</Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
          <p className="text-muted-foreground text-xs">{t.profile.emailNote}</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            disabled={!hasChanges || isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t.profile.saving}
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                {t.profile.saveChanges}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
