'use client';

import { CreditCard, Lock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';

export function CardPanel() {
  const { t } = useLanguage();

  return (
    <section className="flex flex-col gap-4 mt-2 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.checkout.paymentDetails}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Lock className="size-3.5" />
          {t.checkout.secureTransaction}
        </span>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm">
        {/* Card Visual */}
        <div className="mb-6 h-48 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex justify-between items-start z-10">
            <div className="w-10 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded opacity-80" />
            <span className="text-sm font-medium tracking-widest opacity-80">DEBIT</span>
          </div>
          <div className="z-10">
            <p className="font-mono text-xl tracking-[0.15em] mb-4">•••• •••• •••• 4242</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">{t.checkout.cardHolder}</p>
                <p className="text-sm font-medium tracking-wide">JENNY WILSON</p>
              </div>
              <div>
                <p className="text-[10px] opacity-60 uppercase tracking-wider">{t.checkout.expiry}</p>
                <p className="text-sm font-medium tracking-wide">12/25</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t.checkout.cardHolder}
            </label>
            <input
              type="text"
              placeholder="e.g. Jenny Wilson"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t.checkout.cardNumber}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-3 pl-11 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0 transition-colors"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <CreditCard className="size-5" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.checkout.expiry}
              </label>
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1 uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t.checkout.cvc}
              </label>
              <input
                type="text"
                placeholder="123"
                className="w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white placeholder:text-gray-400 focus:border-emerald-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
