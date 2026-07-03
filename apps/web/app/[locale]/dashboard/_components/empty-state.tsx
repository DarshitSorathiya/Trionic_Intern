import { FileText, RefreshCw, SearchX, Scale, FileSignature, ShieldCheck, ShoppingCart, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import type { DocumentType } from "@trionic/shared";

export type EmptyStateType = "empty" | "loading" | "error" | "no-results";

const DOC_TYPE_CARDS: { type: DocumentType; label: string; description: string; icon: React.ElementType }[] = [
  {
    type: "rti_application",
    label: "RTI Application",
    description: "Request information from government bodies",
    icon: FileText,
  },
  {
    type: "legal_notice",
    label: "Legal Notice",
    description: "Send a formal legal notice to any party",
    icon: Scale,
  },
  {
    type: "nda",
    label: "NDA",
    description: "Non-disclosure agreement for confidentiality",
    icon: ShieldCheck,
  },
  {
    type: "consumer_complaint",
    label: "Consumer Complaint",
    description: "File a complaint against a product or service",
    icon: ShoppingCart,
  },
  {
    type: "cheque_bounce_notice",
    label: "Cheque Bounce Notice",
    description: "Legal notice under NI Act § 138",
    icon: Banknote,
  },
];

function getNoResultsMessage(activeFilter?: DocumentType): { title: string; description: string } {
  if (activeFilter) {
    const card = DOC_TYPE_CARDS.find((c) => c.type === activeFilter);
    return {
      title: `No ${card?.label ?? "documents"} found`,
      description: "You haven't created this type of document yet. Start one below.",
    };
  }
  return {
    title: "No results found",
    description: "No documents match your current filters. Try adjusting or clearing your filters.",
  };
}

interface EmptyStateProps {
  type: EmptyStateType;
  onRetry?: () => void;
  activeFilter?: DocumentType;
}

export function EmptyState({ type, onRetry, activeFilter }: EmptyStateProps) {

  if (type === "loading") {
    return (
      <div className="flex flex-col gap-3 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-lg bg-zinc-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
          <RefreshCw className="h-6 w-6 text-zinc-400" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-zinc-800">Failed to load documents</p>
          <p className="text-sm text-zinc-500 max-w-sm">Something went wrong while fetching your documents. Please try again.</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (type === "no-results") {
    const { title, description } = getNoResultsMessage(activeFilter);
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
          <SearchX className="h-6 w-6 text-zinc-400" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-zinc-800">{title}</p>
          <p className="text-sm text-zinc-500 max-w-sm">{description}</p>
        </div>
        <Button asChild>
          <Link href="/new">+ New Draft</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
          <FileSignature className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-800">No drafts yet</p>
        <p className="text-sm text-zinc-500 max-w-sm">
          Start your first legal draft. Choose a document type below.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
        {DOC_TYPE_CARDS.map(({ type, label, description, icon: Icon }) => (
          <Link
            key={type}
            href={`/new?doc_type=${type}`}
            className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100">
              <Icon className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-sm font-semibold text-zinc-800">{label}</p>
            <p className="text-xs text-zinc-500">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}