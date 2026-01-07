"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";
import { authApi } from "@/lib/api/auth";
import { getReturnUrl, buildReturnUrlString } from "@/lib/utils/return-url";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get token and email from URL params
        const token = searchParams.get("token");
        const emailParam = searchParams.get("email");

        if (!token || !emailParam) {
          throw new Error("Thiếu token hoặc email trong link xác thực");
        }

        setEmail(emailParam);

        // Call API to verify email
        const response = await authApi.verifyEmail(
          decodeURIComponent(emailParam),
          token,
        );

        setStatus("success");
      } catch (err: any) {
        console.error("Email verification error:", err);
        setStatus("error");
        setErrorMessage(
          err.message ||
            "Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.",
        );
      }
    };

    handleVerification();
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      await authApi.resendEmail(email, "email_verification");
      alert("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.");
    } catch (err: any) {
      alert("Không thể gửi lại email. Vui lòng thử lại sau.");
    }
  };

  const handleGoToLogin = () => {
    // Get returnUrl from localStorage (saved when user was on menu/landing page)
    const returnUrl = getReturnUrl();
    const returnUrlString = returnUrl ? buildReturnUrlString(returnUrl) : "/";

    router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrlString)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        {status === "loading" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="size-12 text-emerald-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Đang xác thực email...
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Xác thực email thành công!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Email của bạn đã được xác thực. Bây giờ bạn có thể đăng nhập.
            </p>
            <Button
              onClick={handleGoToLogin}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="size-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Xác thực email thất bại
            </h1>
            <p className="text-red-500 dark:text-red-400 mb-6">
              {errorMessage}
            </p>

            {email && (
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full h-12 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                >
                  <Mail className="size-4 mr-2" />
                  Gửi lại email xác thực
                </Button>
                <Button
                  onClick={handleGoToLogin}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
                >
                  Đi đến trang đăng nhập
                </Button>
              </div>
            )}

            {!email && (
              <Button
                onClick={() => router.push("/auth/register")}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl"
              >
                Đăng ký tài khoản mới
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <LanguageProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-8">
            <div className="w-full max-w-md">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
                <div className="flex justify-center mb-6">
                  <Loader2 className="size-12 text-emerald-500 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Đang xác thực email...
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            </div>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </LanguageProvider>
  );
}
