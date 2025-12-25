"use client";

import { Check, CookingPot, Bell, CheckCircle, Info } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

type OrderStatus = "accepted" | "preparing" | "ready" | "served";

interface OrderStatusStepperProps {
  currentStatus: OrderStatus;
}

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
  const { t } = useLanguage();

  const steps: { id: OrderStatus; label: string; icon: React.ReactNode }[] = [
    {
      id: "accepted",
      label: t.track.accepted,
      icon: <Check className="size-3.5" strokeWidth={3} />,
    },
    {
      id: "preparing",
      label: t.track.cooking,
      icon: <CookingPot className="size-3.5" />,
    },
    { id: "ready", label: t.track.ready, icon: <Bell className="size-3.5" /> },
    {
      id: "served",
      label: t.track.served,
      icon: <CheckCircle className="size-3.5" />,
    },
  ];

  const statusOrder = ["accepted", "preparing", "ready", "served"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepState = (stepId: OrderStatus) => {
    const stepIndex = statusOrder.indexOf(stepId);
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-slate-800/50 rounded-b-2xl">
      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        {/* Line background */}
        <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 dark:bg-slate-600 -z-10" />

        {steps.map((step) => {
          const state = getStepState(step.id);
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-sm ${
                  state === "completed"
                    ? "bg-emerald-500 text-white"
                    : state === "active"
                      ? "bg-emerald-500 text-white ring-4 ring-emerald-200 dark:ring-emerald-500/30 animate-pulse"
                      : "bg-gray-200 dark:bg-slate-600 text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] font-medium uppercase ${
                  state === "active"
                    ? "text-slate-900 dark:text-white font-bold"
                    : state === "completed"
                      ? "text-slate-600 dark:text-slate-400"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <div className="mt-4 flex items-start gap-3 p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
        <Info className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          {t.track.preparingMessage}
        </p>
      </div>
    </div>
  );
}
