'use client';

import { CreditCard, Wallet, Store } from 'lucide-react';
import type { PaymentMethod } from '@/lib/types/checkout';
import { useLanguage } from '@/lib/i18n/context';

interface MethodPickerProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export function MethodPicker({ selectedMethod, onSelect }: MethodPickerProps) {
  const { t } = useLanguage();

  const methods: {
    id: PaymentMethod;
    title: string;
    desc: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'e-wallet',
      title: t.checkout.eWallet,
      desc: t.checkout.eWalletDesc,
      icon: <Wallet className="size-5" />,
      badge: t.checkout.zeroFees,
      badgeColor: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'card',
      title: t.checkout.card,
      desc: t.checkout.cardDesc,
      icon: <CreditCard className="size-5" />,
      badge: t.checkout.cardFee,
      badgeColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      id: 'counter',
      title: t.checkout.counter,
      desc: t.checkout.counterDesc,
      icon: <Store className="size-5" />,
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        {t.checkout.selectPaymentMethod}
      </h2>
      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`group relative flex items-start gap-4 rounded-xl border cursor-pointer transition-all shadow-sm p-4 ${
              selectedMethod === method.id
                ? 'border-2 border-emerald-500 shadow-md bg-white dark:bg-slate-800'
                : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <input
              type="radio"
              name="payment_method"
              checked={selectedMethod === method.id}
              onChange={() => onSelect(method.id)}
              className="mt-1 h-5 w-5 border-2 border-gray-300 text-emerald-500 focus:ring-0 accent-emerald-500"
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{method.title}</span>
                <span className="text-slate-500 dark:text-slate-400">{method.icon}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{method.desc}</p>
              {method.badge && (
                <span
                  className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-md w-fit ${method.badgeColor}`}
                >
                  {method.badge}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
