"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth-store";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import {
  getReturnUrl,
  buildReturnUrlString,
  clearReturnUrl,
} from "@/lib/utils/return-url";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { login, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get returnUrl from URL params or localStorage
  // searchParams.get() already decodes the value, so we don't need to decode again
  const urlReturnUrl = searchParams.get("returnUrl");
  const storedReturnUrl = getReturnUrl();
  const returnUrl =
    urlReturnUrl ||
    (storedReturnUrl ? buildReturnUrlString(storedReturnUrl) : "/");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  // Save return URL to localStorage for OAuth callback
  useEffect(() => {
    if (returnUrl) {
      localStorage.setItem("qrenso_auth_return_url", returnUrl);
    }
  }, [returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email) {
      setError(t.auth.emailRequired);
      return;
    }
    if (!password) {
      setError(t.auth.passwordRequired);
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password, rememberMe });

      // Update auth store
      login(response.user, response.accessToken);

      // Clear returnUrl from localStorage after successful login
      clearReturnUrl();

      // Redirect to return URL
      router.push(returnUrl);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href={returnUrl}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="size-4" />
          <span>Quay lại</span>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t.auth.loginTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Đăng nhập để quản lý đơn hàng dễ dàng hơn
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
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                {t.auth.rememberMe}
              </label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {t.auth.loggingIn}
                </>
              ) : (
                t.auth.loginButton
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-800 px-3 text-slate-500 dark:text-slate-400">
                {t.auth.orContinueWith}
              </span>
            </div>
          </div>

          {/* Google Login */}
          <GoogleLoginButton />

          {/* Guest Login Button */}
          <Button
            type="button"
            onClick={() => {
              // Extract tenantSlug from returnUrl if available, otherwise redirect to home
              let redirectUrl = "/";
              if (returnUrl && returnUrl !== "/") {
                // Try to extract tenantSlug from returnUrl (format: /{tenantSlug}/...)
                const match = returnUrl.match(/^\/([^/]+)/);
                if (match) {
                  redirectUrl = `/${match[1]}/menu`;
                } else {
                  redirectUrl = returnUrl;
                }
              }
              router.push(redirectUrl);
            }}
            variant="outline"
            className="w-full h-12 mt-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-xl"
          >
            <User className="size-4 mr-2" />
            Tiếp tục với tư cách khách
          </Button>

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t.auth.noAccount}{" "}
            <Link
              href={`/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              {t.auth.register}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="size-12 text-emerald-500 animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <LanguageProvider>
      <Suspense fallback={<LoadingFallback />}>
        <LoginContent />
      </Suspense>
    </LanguageProvider>
  );
}

