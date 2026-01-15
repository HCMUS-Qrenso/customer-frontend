"use client";

import {
  Ticket,
  Percent,
  DollarSign,
  Clock,
  Users,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicVoucher } from "@/lib/api/voucher";

interface VoucherCardProps {
  voucher: PublicVoucher;
  isEligible?: boolean;
  className?: string;
}

/**
 * Card displaying a public voucher with discount info and eligibility
 */
export function VoucherCard({
  voucher,
  isEligible = true,
  className,
}: VoucherCardProps) {
  const formatDiscount = () => {
    if (voucher.discountType === "percent") {
      let text = `${voucher.percentOff}%`;
      if (voucher.maxDiscountAmount) {
        text += ` (tối đa ${new Intl.NumberFormat("vi-VN").format(voucher.maxDiscountAmount)}₫)`;
      }
      return text;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(voucher.amountOff || 0);
  };

  const formatConditions = () => {
    const conditions: string[] = [];

    if (voucher.minSubtotal) {
      conditions.push(
        `Đơn từ ${new Intl.NumberFormat("vi-VN").format(voucher.minSubtotal)}₫`,
      );
    }
    if (voucher.minParty) {
      conditions.push(`Từ ${voucher.minParty} khách`);
    }

    return conditions;
  };

  const conditions = formatConditions();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border",
        isEligible
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
          : "border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-60",
        className,
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900" />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "p-2 rounded-lg shrink-0",
            isEligible
              ? "bg-green-100 dark:bg-green-800/40"
              : "bg-gray-200 dark:bg-gray-700",
          )}
        >
          {voucher.discountType === "percent" ? (
            <Percent
              className={cn(
                "h-5 w-5",
                isEligible ? "text-green-600" : "text-gray-500",
              )}
            />
          ) : (
            <Ticket
              className={cn(
                "h-5 w-5",
                isEligible ? "text-green-600" : "text-gray-500",
              )}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  isEligible
                    ? "text-green-700 dark:text-green-300"
                    : "text-gray-600 dark:text-gray-400",
                )}
              >
                Giảm {formatDiscount()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                {voucher.name}
              </p>
            </div>
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0",
                isEligible
                  ? "bg-green-100 text-green-700 dark:bg-green-800/40 dark:text-green-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
              )}
            >
              {voucher.code}
            </span>
          </div>

          {/* Conditions */}
          {conditions.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              {conditions.map((condition, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400"
                >
                  {condition.includes("Đơn") ? (
                    <ShoppingBag className="h-3 w-3" />
                  ) : condition.includes("khách") ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {condition}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Not eligible overlay */}
      {!isEligible && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <span className="text-xs text-gray-500 px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
            Chưa đủ điều kiện
          </span>
        </div>
      )}
    </div>
  );
}
