"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, LogIn, UserPlus, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { useLanguage } from "@/lib/i18n/context";

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  const { user, isAuthenticated, logout: logoutStore, setLoading } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build return URL for login/register redirect
  const buildReturnUrl = () => {
    const params = searchParams.toString();
    return params ? `${pathname}?${params}` : pathname;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setLoading(true);
      
      await authApi.logout();
    } catch (error) {
      // Logout might fail if token already expired, but we still want to clear local state
      console.error("Logout error:", error);
    } finally {
      logoutStore();
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Login/Register URLs with return path
  const returnUrl = encodeURIComponent(buildReturnUrl());
  const loginUrl = `/auth/login?returnUrl=${returnUrl}`;
  const registerUrl = `/auth/register?returnUrl=${returnUrl}`;

  return (
    <div ref={dropdownRef} className={`relative ${className || ""}`}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
        aria-label={isAuthenticated ? "User menu" : "Login"}
      >
        {isAuthenticated && user ? (
          // Authenticated: Show avatar
          <div className="flex items-center gap-2">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="size-8 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {getInitials(user.fullName)}
              </div>
            )}
            <ChevronDown className={`size-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        ) : (
          // Unauthenticated: Show user icon
          <div className="flex size-9 items-center justify-center rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <User className="size-5 text-slate-500" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 overflow-hidden">
          {isAuthenticated && user ? (
            // Authenticated Menu
            <>
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {user.fullName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  <LogOut className="size-4" />
                  <span>{isLoggingOut ? "Đang đăng xuất..." : (t?.auth?.logout || "Đăng xuất")}</span>
                </button>
              </div>
            </>
          ) : (
            // Unauthenticated Menu
            <div className="py-1">
              <Link
                href={loginUrl}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <LogIn className="size-4" />
                <span>{t?.auth?.login || "Đăng nhập"}</span>
              </Link>
              <Link
                href={registerUrl}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <UserPlus className="size-4" />
                <span>{t?.auth?.register || "Đăng ký"}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

