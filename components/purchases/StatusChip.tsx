import { Sparkles, Check, Truck, Gift } from "lucide-react";
import { STATUS_LABELS, type PurchaseStatus } from "@/lib/domain";

const STATUS_CHIP_STYLES: Record<PurchaseStatus, string> = {
  IDEA: "border border-dashed border-cocoa-soft bg-cream text-cocoa-soft",
  PURCHASED: "bg-amber/20 text-cocoa",
  ARRIVED: "bg-pine/15 text-pine-deep",
  WRAPPED: "bg-pine text-white",
};

const STATUS_ICONS: Record<PurchaseStatus, typeof Sparkles> = {
  IDEA: Sparkles,
  PURCHASED: Check,
  ARRIVED: Truck,
  WRAPPED: Gift,
};

export default function StatusChip({ status }: { status: PurchaseStatus }) {
  const Icon = STATUS_ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CHIP_STYLES[status]}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
