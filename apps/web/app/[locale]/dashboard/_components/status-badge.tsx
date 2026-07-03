import type { DocumentStatus } from "@trionic/shared";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  DocumentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  draft:      { label: "Draft",      variant: "secondary",    className: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-100" },
  generating: { label: "Generating", variant: "default",      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 animate-pulse" },
  final:      { label: "Final",      variant: "default",      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50" },
  failed:     { label: "Failed",     variant: "destructive",  className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50" },
  exported:   { label: "Exported",   variant: "default",      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50" },
  archived:   { label: "Archived",   variant: "outline",      className: "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-50" },
};

import { useTranslations } from "next-intl";

const STATUS_KEYS: Record<DocumentStatus, string> = {
  draft: "statusDraft",
  generating: "statusGenerating",
  final: "statusFinal",
  failed: "statusFailed",
  exported: "statusExported",
  archived: "statusArchived",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status];
  const t = useTranslations("dashboard.filters");
  return (
    <Badge variant={config.variant} className={`text-xs font-medium border ${config.className}`}>
      {t(STATUS_KEYS[status])}
    </Badge>
  );
}
