'use client';

import { AlertTriangle, QrCode, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CustomerContextError } from '@/lib/types/menu';

interface InvalidSessionStateProps {
  type: CustomerContextError;
}

export function InvalidSessionState({ type }: InvalidSessionStateProps) {
  const getContent = () => {
    switch (type) {
      case 'missing_params':
        return {
          icon: QrCode,
          title: 'Vui lòng quét mã QR',
          description: 'Bạn cần quét mã QR tại bàn để truy cập menu.',
          showRetry: false,
        };
      case 'invalid_table':
        return {
          icon: AlertTriangle,
          title: 'Mã QR không hợp lệ',
          description: 'Mã QR bạn quét không đúng hoặc đã hết hạn. Vui lòng quét lại.',
          showRetry: true,
        };
      case 'inactive':
        return {
          icon: Clock,
          title: 'Bàn tạm ngưng phục vụ',
          description: 'Bàn này hiện không hoạt động. Vui lòng liên hệ nhân viên.',
          showRetry: false,
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Đã có lỗi xảy ra',
          description: 'Vui lòng thử lại sau.',
          showRetry: true,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 text-center text-white">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-500/10">
        <Icon className="size-10 text-red-500" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">{content.title}</h1>
      <p className="mb-8 max-w-sm text-slate-400">{content.description}</p>
      {content.showRetry && (
        <Button
          onClick={() => window.location.reload()}
          className="gap-2 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          Thử lại
        </Button>
      )}
    </div>
  );
}
