"use client";

import type { Document, DocumentType } from "@trionic/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "@/i18n/routing";
import { StatusBadge } from "./status-badge";
import { useTranslations } from "next-intl";

const DOC_TYPE_KEYS: Record<DocumentType, string> = {
  rti_application: "docTypeOptionRti",
  legal_notice: "docTypeOptionNotice",
  nda: "docTypeOptionNda",
  consumer_complaint: "docTypeOptionConsumer",
  cheque_bounce_notice: "docTypeOptionCheque",
};

const MOCK_TITLE_KEYS: Record<string, string> = {
  "RTI – Municipal records": "mockTitleRti",
  "RTI – Municipal records (Demo Mode)": "mockTitleRti",
  "Legal notice – Tenant deposit": "mockTitleNotice",
  "NDA – Freelance contract": "mockTitleNda",
};

/** Formats an ISO timestamp as a relative string using translation keys. */
function formatDate(iso: string, tTable: any): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);

    if (mins  <  1) return tTable("justNow");
    if (mins  < 60) return tTable("minsAgo", { mins });
    if (hours < 24) return tTable("hoursAgo", { hours });
    if (days  <  7) return tTable("daysAgo", { days });

    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface DocumentTableProps {
  documents: Document[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tLang = useTranslations("languages");
  const tIntake = useTranslations("intake");
  const tTable = useTranslations("dashboard.table");

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="font-semibold text-zinc-700 w-[35%]">{tTable("title")}</TableHead>
            <TableHead className="font-semibold text-zinc-700">{tTable("type")}</TableHead>
            <TableHead className="font-semibold text-zinc-700">{tTable("language")}</TableHead>
            <TableHead className="font-semibold text-zinc-700">{tTable("status")}</TableHead>
            <TableHead className="font-semibold text-zinc-700 text-right">{tTable("lastModified")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="cursor-pointer hover:bg-zinc-50 transition-colors"
              onClick={() => router.push(`/draft/${doc.id}`)}
            >
              <TableCell className="font-medium text-zinc-900 max-w-xs truncate">
                {MOCK_TITLE_KEYS[doc.title] ? t(MOCK_TITLE_KEYS[doc.title]) : (doc.title || "Untitled")}
              </TableCell>
              <TableCell className="text-zinc-600 text-sm">
                {tIntake(DOC_TYPE_KEYS[doc.doc_type]) ?? doc.doc_type}
              </TableCell>
              <TableCell className="text-zinc-600 text-sm">
                {tLang(doc.language) ?? doc.language}
              </TableCell>
              <TableCell>
                <StatusBadge status={doc.status} />
              </TableCell>
              <TableCell className="text-zinc-500 text-sm text-right">
                {formatDate(doc.updated_at, tTable)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
