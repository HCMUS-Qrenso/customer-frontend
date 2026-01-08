import { Metadata, Viewport } from "next";
import { TenantSettingsClientProvider } from "@/providers/tenant-settings-client-provider";

export const metadata: Metadata = {
  title: {
    template: "%s | Qrenso",
    default: "Qrenso - Restaurant Ordering",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Enables safe-area-inset
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function TableLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100svh] bg-slate-100">
      <TenantSettingsClientProvider>{children}</TenantSettingsClientProvider>
    </div>
  );
}
