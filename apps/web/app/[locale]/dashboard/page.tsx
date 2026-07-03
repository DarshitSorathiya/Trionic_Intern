"use client";

import { useEffect, useState, useCallback } from "react";
import type { Document, DocumentType } from "@trionic/shared";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/routing";
import { Plus, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FilterBar, type FilterState } from "./_components/filter-bar";
import { DocumentTable } from "./_components/document-table";
import { EmptyState } from "./_components/empty-state";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

type FetchState = "idle" | "loading" | "error" | "done";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  const [documents, setDocuments]     = useState<Document[]>([]);
  const [fetchState, setFetchState]   = useState<FetchState>("idle");
  const [nextCursor, setNextCursor]   = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const router   = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
    router.refresh();
  }

  const [filters, setFilters] = useState<FilterState>({
    search:   "",
    status:   "all",
    language: "all",
    doc_type: "all",
  });

  // ── fetch documents (initial + filter change) ─────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setFetchState("loading");
    setNextCursor(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/sign-in");
        return;
      }

      const params = new URLSearchParams();
      if (filters.status   !== "all") params.set("status",   filters.status);
      if (filters.language !== "all") params.set("language", filters.language);
      if (filters.doc_type !== "all") params.set("doc_type", filters.doc_type);
      params.set("limit", "20");

      const res = await fetch(`/api/documents?${params.toString()}`);

      if (!res.ok) {
        setFetchState("error");
        return;
      }

      const data = await res.json() as { documents: Document[]; next_cursor: string | null };
      setDocuments(data.documents);
      setNextCursor(data.next_cursor);
      setFetchState("done");
    } catch (err) {
      console.error("[Dashboard] Error fetching documents:", err);
      setFetchState("error");
    }
  }, [filters.status, filters.language, filters.doc_type]);

  // ── load more (pagination via next_cursor) ────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (filters.status   !== "all") params.set("status",   filters.status);
      if (filters.language !== "all") params.set("language", filters.language);
      if (filters.doc_type !== "all") params.set("doc_type", filters.doc_type);
      params.set("limit",  "20");
      params.set("cursor", nextCursor);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (!res.ok) { setLoadingMore(false); return; }

      const data = await res.json() as { documents: Document[]; next_cursor: string | null };
      setDocuments((prev) => [...prev, ...data.documents]);
      setNextCursor(data.next_cursor);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, filters.status, filters.language, filters.doc_type]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ── client-side title search ──────────────────────────────────────────────
  const visibleDocuments = filters.search.trim()
    ? documents.filter((d) =>
        d.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    : documents;

  // ── which empty state to show ─────────────────────────────────────────────
  const hasActiveFilters =
    filters.status !== "all" ||
    filters.language !== "all" ||
    filters.doc_type !== "all" ||
    filters.search.trim() !== "";

  const emptyType = hasActiveFilters ? "no-results" : "empty";

  return (
    <main className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("title")}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <LanguageSwitcher />
          <Button asChild className="gap-2 cursor-pointer">
            <Link href="/new">
              <Plus className="h-4 w-4" />
              {tCommon("newDraft")}
            </Link>
          </Button>
          <Button variant="outline" className="gap-2 cursor-pointer" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            {tCommon("signOut")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Content */}
      {fetchState === "loading" && (
        <EmptyState type="loading" />
      )}

      {fetchState === "error" && (
        <EmptyState type="error" onRetry={fetchDocuments} />
      )}

      {fetchState === "done" && documents.length === 0 && (
        <EmptyState
          type={emptyType}
          activeFilter={filters.doc_type !== "all" ? (filters.doc_type as DocumentType) : undefined}
        />
      )}

      {fetchState === "done" && documents.length > 0 && visibleDocuments.length === 0 && (
        <EmptyState type="no-results" />
      )}

      {fetchState === "done" && visibleDocuments.length > 0 && (
        <>
          <DocumentTable documents={visibleDocuments} />

          {/* Pagination */}
          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-40"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}