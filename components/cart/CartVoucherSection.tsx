"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Loader2,
  X,
  Ticket,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Check,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { voucherApi, type PublicVoucher } from "@/lib/api/voucher";
import {
  useVoucherStore,
  useAppliedVoucher,
  useVoucherCode,
  useApplyingCode,
  useApplyCodeError,
  usePublicVouchers,
  useUserHasInteracted,
} from "@/lib/stores";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  calculateVoucherDiscount,
  isVoucherApplicable,
  getVoucherValidationError,
  formatVoucherDescription,
  findVoucherByCode,
  createAppliedVoucher,
  findBestAutoApplyVoucher,
  sortVouchersByPriorityAndDiscount,
  getApplicableVouchers,
} from "@/lib/utils/voucher-calculator";
import { useTenantSettings } from "@/providers/tenant-settings-context";

interface CartVoucherSectionProps {
  subtotal: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Cart voucher section component
 * Supports auto-apply vouchers and manual voucher selection
 */
export function CartVoucherSection({
  subtotal,
  disabled = false,
  className,
}: CartVoucherSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const { formatPrice } = useTenantSettings();

  const voucherCode = useVoucherCode();
  const applyingCode = useApplyingCode();
  const applyCodeError = useApplyCodeError();
  const appliedVoucher = useAppliedVoucher();
  const publicVouchers = usePublicVouchers();
  const userHasInteracted = useUserHasInteracted();

  const {
    setVoucherCode,
    setApplyingCode,
    setApplyCodeError,
    setAppliedVoucher,
    clearAppliedVoucher,
    setPublicVouchers,
    setPublicVouchersLoading,
    setPublicVouchersError,
    setUserHasInteracted,
  } = useVoucherStore();

  // Get applicable vouchers sorted by priority
  const applicableVouchers = useMemo(() => {
    return sortVouchersByPriorityAndDiscount(
      getApplicableVouchers(publicVouchers, subtotal),
      subtotal
    );
  }, [publicVouchers, subtotal]);

  // Fetch public vouchers on mount (only if session exists)
  useEffect(() => {
    const fetchVouchers = async () => {
      if (publicVouchers.length > 0) return; // Already loaded

      // Check if session token exists - required for tenant identification
      const { getSessionToken } = await import("@/lib/stores/qr-token-store");
      const sessionToken = getSessionToken();
      if (!sessionToken) {
        console.log("[CartVoucher] No session token, skipping voucher fetch");
        return;
      }

      setIsLoadingVouchers(true);
      setPublicVouchersLoading(true);
      try {
        const response = await voucherApi.getPublicVouchers();
        if (response.success && response.data) {
          setPublicVouchers(response.data);
        }
      } catch (error) {
        console.error("[CartVoucher] Failed to fetch vouchers:", error);
        setPublicVouchersError("Không thể tải danh sách mã giảm giá");
      } finally {
        setIsLoadingVouchers(false);
        setPublicVouchersLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  // Auto-apply best voucher on mount (only if user hasn't interacted)
  useEffect(() => {
    // Skip if user has already interacted or voucher already applied
    if (userHasInteracted || appliedVoucher || publicVouchers.length === 0) {
      return;
    }

    // Find best auto-apply voucher (exclude already used in this session)
    const availableForAutoApply = publicVouchers.filter(v => !v.isUsedInSession);
    const bestAuto = findBestAutoApplyVoucher(availableForAutoApply, subtotal);
    if (bestAuto) {
      const discount = calculateVoucherDiscount(bestAuto, subtotal);
      setAppliedVoucher(createAppliedVoucher(bestAuto, discount, true));
      console.log("[CartVoucher] Auto-applied voucher:", bestAuto.code);
    }
  }, [publicVouchers, subtotal, userHasInteracted, appliedVoucher]);

  // Recalculate discount when subtotal changes
  useEffect(() => {
    if (appliedVoucher && appliedVoucher.redemptionId.startsWith("preview_")) {
      // Find the original voucher to recalculate
      const voucher = publicVouchers.find((v) => v.id === appliedVoucher.voucherId);
      if (voucher) {
        const newDiscount = calculateVoucherDiscount(voucher, subtotal);
        if (newDiscount !== appliedVoucher.discountAmount) {
          setAppliedVoucher({
            ...appliedVoucher,
            discountAmount: newDiscount,
          });
        }

        // Check if still applicable
        if (!isVoucherApplicable(voucher, subtotal)) {
          clearAppliedVoucher();
          setUserHasInteracted(true);
          toast.error("Đơn hàng không còn đủ điều kiện áp dụng mã giảm giá");
        }
      }
    }
  }, [subtotal]);

  const handleApplyCode = async () => {
    if (!voucherCode.trim()) {
      setApplyCodeError("Vui lòng nhập mã voucher");
      return;
    }

    setApplyingCode(true);
    setApplyCodeError(null);

    // Simulate slight delay for better UX
    await new Promise((r) => setTimeout(r, 300));

    try {
      // Find voucher in public vouchers list
      const voucher = findVoucherByCode(publicVouchers, voucherCode);

      if (!voucher) {
        setApplyCodeError("Mã voucher không hợp lệ hoặc đã hết hiệu lực");
        setApplyingCode(false);
        return;
      }

      // Check if already used in session
      if (voucher.isUsedInSession) {
        setApplyCodeError("Bạn đã sử dụng mã này trong phiên hiện tại");
        setApplyingCode(false);
        return;
      }

      // Validate voucher
      const validationError = getVoucherValidationError(voucher, subtotal);
      if (validationError) {
        setApplyCodeError(validationError);
        setApplyingCode(false);
        return;
      }

      // Check if applicable
      if (!isVoucherApplicable(voucher, subtotal)) {
        setApplyCodeError(
          `Đơn hàng tối thiểu ${formatPrice(voucher.minSubtotal || 0)} để áp dụng mã này`
        );
        setApplyingCode(false);
        return;
      }

      // Calculate discount and create preview (manual selection)
      const discountAmount = calculateVoucherDiscount(voucher, subtotal);
      setAppliedVoucher(createAppliedVoucher(voucher, discountAmount, false));
      setUserHasInteracted(true);
      setVoucherCode("");
      setIsExpanded(false);
      setShowVoucherList(false);
      toast.success(`Áp dụng thành công: ${voucher.name}`);
    } catch (error) {
      setApplyCodeError("Không thể áp dụng mã voucher");
    } finally {
      setApplyingCode(false);
    }
  };

  const handleSelectVoucher = (voucher: PublicVoucher) => {
    const discountAmount = calculateVoucherDiscount(voucher, subtotal);
    setAppliedVoucher(createAppliedVoucher(voucher, discountAmount, false));
    setUserHasInteracted(true);
    setShowVoucherList(false);
    setIsExpanded(false);
    toast.success(`Áp dụng thành công: ${voucher.name}`);
  };

  const handleRemoveVoucher = () => {
    clearAppliedVoucher();
    setUserHasInteracted(true);
    toast.success("Đã gỡ voucher");
  };

  // Show applied voucher badge
  if (appliedVoucher) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-lg">
                <Ticket className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    {appliedVoucher.name}
                  </p>
                  {appliedVoucher.isAutoApplied && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      Tự động
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Mã: {appliedVoucher.code} • Giảm {formatPrice(appliedVoucher.discountAmount)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveVoucher}
              className="text-green-700 hover:text-green-900 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-800/40 h-8 w-8 rounded-full"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Show "Choose another" option if there are more vouchers */}
        {applicableVouchers.length > 1 && (
          <button
            onClick={() => setShowVoucherList(!showVoucherList)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            <span>Chọn mã khác ({applicableVouchers.length - 1} mã)</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showVoucherList && "rotate-180")} />
          </button>
        )}

        {/* Voucher selection list */}
        {showVoucherList && (
          <VoucherList
            vouchers={applicableVouchers}
            currentVoucherId={appliedVoucher.voucherId}
            subtotal={subtotal}
            formatPrice={formatPrice}
            onSelect={handleSelectVoucher}
          />
        )}
      </div>
    );
  }

  // Collapsed state - show expand button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        disabled={disabled || isLoadingVouchers}
        className={cn(
          "w-full flex items-center justify-between p-4 text-left rounded-xl border border-dashed",
          "border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400",
          "bg-white dark:bg-slate-800/50 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Tag className="h-5 w-5" />
          <span className="text-sm font-medium">
            {applicableVouchers.length > 0
              ? `${applicableVouchers.length} mã giảm giá có sẵn`
              : "Có mã giảm giá?"}
          </span>
        </div>
        {isLoadingVouchers ? (
          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
    );
  }

  // Expanded state - show input and voucher list
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Tag className="h-4 w-4" />
          <span className="text-sm font-medium">Nhập mã giảm giá</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          placeholder="VD: GIAMGIA20"
          className="uppercase flex-1 font-medium tracking-wide"
          disabled={disabled || applyingCode}
          onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
        />
        <Button
          onClick={handleApplyCode}
          disabled={disabled || applyingCode || !voucherCode.trim()}
          className="px-6 bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {applyingCode ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>

      {applyCodeError && (
        <div className="flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{applyCodeError}</span>
        </div>
      )}

      {/* Available vouchers list */}
      {applicableVouchers.length > 0 && (
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
            Hoặc chọn mã có sẵn
          </p>
          <VoucherList
            vouchers={applicableVouchers}
            subtotal={subtotal}
            formatPrice={formatPrice}
            onSelect={handleSelectVoucher}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Voucher list component for displaying selectable vouchers
 */
function VoucherList({
  vouchers,
  currentVoucherId,
  subtotal,
  formatPrice,
  onSelect,
}: {
  vouchers: PublicVoucher[];
  currentVoucherId?: string;
  subtotal: number;
  formatPrice: (amount: number) => string;
  onSelect: (voucher: PublicVoucher) => void;
}) {
  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {vouchers.map((voucher) => {
        const discount = calculateVoucherDiscount(voucher, subtotal);
        const isCurrent = voucher.id === currentVoucherId;

        return (
          <button
            key={voucher.id}
            onClick={() => !isCurrent && !voucher.isUsedInSession && onSelect(voucher)}
            disabled={isCurrent || voucher.isUsedInSession}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors",
              isCurrent
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : voucher.isUsedInSession
                ? "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed"
                : "border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-1.5 rounded-lg",
                  isCurrent
                    ? "bg-emerald-100 dark:bg-emerald-800/40"
                    : "bg-gray-100 dark:bg-slate-700"
                )}
              >
                <Ticket
                  className={cn(
                    "h-4 w-4",
                    isCurrent
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent
                        ? "text-emerald-800 dark:text-emerald-200"
                        : voucher.isUsedInSession
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-800 dark:text-gray-200"
                    )}
                  >
                    {voucher.code}
                  </p>
                  {voucher.autoApply && !voucher.isUsedInSession && (
                    <Star className="h-3 w-3 text-amber-500" />
                  )}
                  {voucher.isUsedInSession && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400 rounded">
                      Đã sử dụng
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500 text-white rounded">
                      Đang dùng
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatVoucherDescription(voucher)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "text-sm font-bold",
                  isCurrent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : voucher.isUsedInSession
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-200"
                )}
              >
                -{formatPrice(discount)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
