"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { authApi } from "@/lib/api/auth";

function ForgotPasswordContent() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Forgot Password | Qrenso";
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email) {
      setError(t.auth.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      setError(t.auth.invalidEmail);
      return;
    }

    try {
      setIsLoading(true);
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State - Email Sent
  if (isSubmitted) {
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
                {t.auth.checkEmailTitle}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.auth.checkEmailMessage}{" "}
                <span className="font-medium text-slate-900 dark:text-white">
                  {email}
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                {t.auth.checkSpam}
              </p>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.auth.linkExpiry}
              </p>
            </div>

            {/* Back to Login */}
            <Button
              asChild
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
            >
              <Link href="/auth/login">{t.auth.backToLogin}</Link>
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
          {/* Back Button */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" />
            {t.auth.backToLogin}
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t.auth.forgotPasswordTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.auth.forgotPasswordDesc}
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
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
                  {t.auth.sending}
                </>
              ) : (
                t.auth.sendResetLink
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.auth.hasAccount}{" "}
              <Link
                href="/auth/login"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                {t.auth.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <LanguageProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </div>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </LanguageProvider>
  );
}
