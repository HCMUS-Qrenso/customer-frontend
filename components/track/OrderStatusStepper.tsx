"use client";

import { Check, CookingPot, Bell, CheckCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

// Order status from API
type OrderStatus = "pending" | "accepted" | "in_progress" | "ready" | "served" | "completed" | "cancelled" | "rejected";

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
}

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
  const { t } = useLanguage();

  const steps = [
    { id: "accepted", icon: Check },
    { id: "preparing", icon: CookingPot },
    { id: "ready", icon: Bell },
    { id: "served", icon: CheckCircle },
  ];

  // Map API status to stepper position
  const getStepperStatus = (apiStatus: OrderStatus): string => {
    switch (apiStatus) {
      case "pending": return "pending";
      case "accepted": return "accepted";
      case "in_progress": return "preparing";
      case "ready": return "ready";
      case "served": return "served";
      case "completed": return "served";
      case "cancelled":
      case "rejected": return "cancelled";
      default: return "pending";
    }
  };

  const getStatusLabel = (apiStatus: OrderStatus): string => {
    switch (apiStatus) {
      case "pending": return t.track.pending;
      case "accepted": return t.track.accepted;
      case "in_progress": return t.track.cooking;
      case "ready": return t.track.ready;
      case "served":
      case "completed": return t.track.served;
      default: return "";
    }
  };

  const stepperStatus = getStepperStatus(currentStatus);
  const statusOrder = ["pending", "accepted", "preparing", "ready", "served"];
  const currentIndex = statusOrder.indexOf(stepperStatus);

  const getStepState = (stepId: string) => {
    const stepIndex = statusOrder.indexOf(stepId);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="py-4">
      {/* Status Chip - Prominent */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {getStatusLabel(currentStatus)}
          </span>
        </span>
      </div>

      {/* Minimal Stepper - Dots with line */}
      <div className="flex items-center justify-center px-8">
        <div className="flex items-center gap-0 w-full max-w-xs">
          {steps.map((step, index) => {
            const state = getStepState(step.id);
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Icon circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    state === "completed"
                      ? "bg-emerald-500 text-white"
                      : state === "active"
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300 dark:ring-emerald-500/50"
                        : "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={2.5} />
                </div>

                {/* Connecting line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-1">
                    <div
                      className={`h-full transition-all ${
                        state === "completed" || state === "active"
                          ? "bg-emerald-500"
                          : "bg-gray-200 dark:bg-slate-700"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
