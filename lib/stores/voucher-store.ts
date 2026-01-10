/**
 * Voucher Store
 * Zustand store for managing voucher state in customer flow
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppliedVoucher, PublicVoucher } from "@/lib/api/voucher";

interface VoucherState {
  // Available public vouchers for display
  publicVouchers: PublicVoucher[];
  publicVouchersLoading: boolean;
  publicVouchersError: string | null;

  // Currently applied voucher (only one allowed per MVP)
  appliedVoucher: AppliedVoucher | null;

  // Voucher code input state
  voucherCode: string;
  applyingCode: boolean;
  applyCodeError: string | null;

  // Flag to prevent re-auto-apply after user manually interacts
  // true = user has removed/changed voucher, don't auto-apply again
  userHasInteracted: boolean;
}

interface VoucherActions {
  // Public vouchers
  setPublicVouchers: (vouchers: PublicVoucher[]) => void;
  setPublicVouchersLoading: (loading: boolean) => void;
  setPublicVouchersError: (error: string | null) => void;

  // Applied voucher
  setAppliedVoucher: (voucher: AppliedVoucher | null) => void;
  clearAppliedVoucher: () => void;

  // Voucher code input
  setVoucherCode: (code: string) => void;
  setApplyingCode: (applying: boolean) => void;
  setApplyCodeError: (error: string | null) => void;

  // User interaction tracking
  setUserHasInteracted: (interacted: boolean) => void;

  // Reset on order completion or session clear
  reset: () => void;
}

type VoucherStore = VoucherState & VoucherActions;

const initialState: VoucherState = {
  publicVouchers: [],
  publicVouchersLoading: false,
  publicVouchersError: null,
  appliedVoucher: null,
  voucherCode: "",
  applyingCode: false,
  applyCodeError: null,
  userHasInteracted: false,
};

export const useVoucherStore = create<VoucherStore>()(
  persist(
    (set) => ({
      ...initialState,

      setPublicVouchers: (vouchers) =>
        set({ publicVouchers: vouchers, publicVouchersError: null }),

      setPublicVouchersLoading: (loading) =>
        set({ publicVouchersLoading: loading }),

      setPublicVouchersError: (error) =>
        set({ publicVouchersError: error, publicVouchersLoading: false }),

      setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),

      clearAppliedVoucher: () =>
        set({ appliedVoucher: null, voucherCode: "", applyCodeError: null }),

      setVoucherCode: (code) => set({ voucherCode: code, applyCodeError: null }),

      setApplyingCode: (applying) => set({ applyingCode: applying }),

      setApplyCodeError: (error) =>
        set({ applyCodeError: error, applyingCode: false }),

      setUserHasInteracted: (interacted) =>
        set({ userHasInteracted: interacted }),

      reset: () => set(initialState),
    }),
    {
      name: "qrenso_voucher",
      storage: createJSONStorage(() => localStorage),
      // Persist applied voucher and user interaction flag for cross-page state
      partialize: (state) => ({
        appliedVoucher: state.appliedVoucher,
        userHasInteracted: state.userHasInteracted,
      }),
    }
  )
);

// ============================================
// Selector hooks for optimized re-renders
// ============================================

export const useAppliedVoucher = () =>
  useVoucherStore((state) => state.appliedVoucher);

export const usePublicVouchers = () =>
  useVoucherStore((state) => state.publicVouchers);

export const useVoucherCode = () =>
  useVoucherStore((state) => state.voucherCode);

export const useApplyingCode = () =>
  useVoucherStore((state) => state.applyingCode);

export const useApplyCodeError = () =>
  useVoucherStore((state) => state.applyCodeError);

export const useUserHasInteracted = () =>
  useVoucherStore((state) => state.userHasInteracted);
