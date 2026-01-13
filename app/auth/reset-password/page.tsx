"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { authApi } from "@/lib/api/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  // Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, including uppercase, lowercase, number and special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!newPassword) {
      setError(t.auth.passwordRequired);
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(t.auth.passwordRequirements);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (!token) {
      setError(t.auth.invalidToken);
      return;
    }

    try {
      setIsLoading(true);
      await authApi.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (
        err.message?.includes("expired") ||
        err.message?.includes("invalid")
      ) {
        setIsInvalidToken(true);
      } else {
        setError(
          err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid Token State
  if (isInvalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center size-16 rounded-full bg-red-50 dark:bg-red-500/10">
                <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.auth.tokenExpired}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.auth.tokenExpiredDesc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
              >
                <Link href="/auth/forgot-password">
                  {t.auth.requestNewLink}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                <Link href="/auth/login">{t.auth.backToLogin}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    // set return url for login
        

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center size-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6 space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.auth.resetPasswordSuccess}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.auth.resetPasswordSuccessDesc}
              </p>
            </div>

            {/* Login Button */}
            <Button
              asChild
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
            >
              <Link href="/auth/login">{t.auth.loginButton}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t.auth.resetPasswordTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.auth.resetPasswordDesc}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t.auth.newPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t.auth.confirmNewPassword}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.auth.passwordRequirements}
              </p>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t.auth.resetting}
                </>
              ) : (
                t.auth.resetPassword
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.auth.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <LanguageProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </LanguageProvider>
  );
}
