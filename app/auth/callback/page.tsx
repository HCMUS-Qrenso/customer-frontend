"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "Authentication | Qrenso";
  }, []);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get access token from URL params (sent by backend after Google OAuth)
        const accessToken = searchParams.get("accessToken");
        const error = searchParams.get("error");

        if (error) {
          throw new Error(error);
        }

        if (!accessToken) {
          throw new Error("No access token received");
        }

        // Temporarily store the access token to make API call
        useAuthStore.getState().setAccessToken(accessToken);

        // Fetch user profile
        const user = await authApi.getProfile();

        // Update auth store with user and token
        login(user, accessToken);

        setStatus("success");

        // Get return URL from localStorage or default to home
        const returnUrl = localStorage.getItem("qrenso_auth_return_url") || "/";
        localStorage.removeItem("qrenso_auth_return_url");

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(returnUrl);
        }, 1000);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");

        // Clear any partial auth state
        useAuthStore.getState().logout();

        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="size-12 text-emerald-500 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Đang xử lý đăng nhập...
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Vui lòng chờ trong giây lát
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Đăng nhập thành công!
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Đang chuyển hướng...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="size-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="size-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Đăng nhập thất bại
            </h1>
            <p className="text-red-500 dark:text-red-400 mb-4">
              {errorMessage}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Đang chuyển về trang đăng nhập...
            </p>
          </>
        )}
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
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Đang xử lý đăng nhập...
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
