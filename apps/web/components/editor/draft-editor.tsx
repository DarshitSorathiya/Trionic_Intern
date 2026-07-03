"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, CheckCircle2, Edit3, Eye, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { useDraftStore } from "../../hooks/use-draft-store";
import { formatNodeIdToBreadcrumb } from "@/lib/citation-utils";
import {
  parseMarkdownToSections,
  serializeSectionsToMarkdown,
  fetchTemplate,
  SectionData,
  DocumentTemplate,
} from "@/lib/document-templates";
import { DraftSection } from "./draft-section";
import type { DocumentType } from "@trionic/shared";
import { useTranslations } from "next-intl";

interface DraftEditorProps {
  value: string;
  onChange: (value: string) => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  className?: string;
  docType?: DocumentType;
}

function CitationBadge({ nodeId, index }: { nodeId: string; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [nodeText, setNodeText] = useState<{ title: string; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const activeCitationNodeId = useDraftStore((state) => state.activeCitationNodeId);
  const setActiveCitationNodeId = useDraftStore((state) => state.setActiveCitationNodeId);
  const toggleCitationDrawer = useDraftStore((state) => state.toggleCitationDrawer);
  const isCitationDrawerOpen = useDraftStore((state) => state.isCitationDrawerOpen);
  const t = useTranslations("draft");

  const handleMouseEnter = async () => {
    setHovered(true);
    if (nodeText || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pageindex/node/${encodeURIComponent(nodeId)}`);
      if (res.ok) {
        const data = await res.json();
        setNodeText({
          title: data.title || formatNodeIdToBreadcrumb(nodeId),
          text: data.text || t("legalTextNotFound")
        });
      } else {
        setNodeText({
          title: formatNodeIdToBreadcrumb(nodeId),
          text: t("failedToFetchNode")
        });
      }
    } catch {
      setNodeText({
        title: formatNodeIdToBreadcrumb(nodeId),
        text: t("errorConnecting")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setActiveCitationNodeId(nodeId);
    if (!isCitationDrawerOpen) {
      toggleCitationDrawer();
    }
    
    // Smooth scroll the drawer card into view
    setTimeout(() => {
      const tileElement = document.getElementById(`node-tile-${nodeId}`);
      if (tileElement) {
        tileElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        
        // Temporary ring glow
        tileElement.classList.add("ring-2", "ring-indigo-500/50", "bg-indigo-50/50", "dark:bg-indigo-950/20");
        setTimeout(() => {
          tileElement.classList.remove("ring-2", "ring-indigo-500/50", "bg-indigo-50/50", "dark:bg-indigo-950/20");
        }, 1500);
      }
    }, 150);
  };

  const isActive = activeCitationNodeId === nodeId;

  return (
    <button
      id={`citation-marker-${index + 1}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative inline-flex items-center justify-center text-center leading-none p-0 font-mono font-bold text-[11px] size-5 rounded-md cursor-pointer transition-all select-none align-middle border mx-0.5",
        isActive
          ? "bg-indigo-600 text-white border-indigo-650 ring-2 ring-indigo-400 shadow-md scale-105"
          : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-250 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-900"
      )}
    >
      {index + 1}
      {hovered && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 p-3 bg-slate-950 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl shadow-2xl font-sans leading-relaxed pointer-events-none z-50 border border-slate-800 dark:border-slate-200 text-left font-normal animate-in fade-in zoom-in-95 duration-100">
          <span className="block font-bold text-xs border-b border-slate-800 dark:border-slate-200 pb-1 mb-1.5 font-serif text-white dark:text-slate-950">
            {loading ? t("loading") : nodeText?.title}
          </span>
          <span className="block text-[11px] text-slate-300 dark:text-slate-650 max-h-32 overflow-y-auto scrollbar-none">
            {loading ? t("fetchingNode") : nodeText?.text}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-950 dark:border-t-white" />
        </span>
      )}
    </button>
  );
}

export function DraftEditor({
  value,
  onChange,
  isSaving = false,
  lastSavedAt,
  className,
  docType,
}: DraftEditorProps) {
  const t = useTranslations("draft");
  const [sections, setSections] = useState<SectionData[]>([]);
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const citations = useDraftStore((state) => state.citations);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize Template and Sections
  useEffect(() => {
    let active = true;
    async function loadTemplate() {
      if (!docType) return;
      const tpl = await fetchTemplate(docType);
      if (active) {
        setTemplate(tpl);
        setSections((prev) => {
          const hasSections = prev.length > 0;
          const allSectionContentEmpty = hasSections && prev.every((s) => !s.content.trim());
          const incomingHasContent = value.trim().length > 0;

          // On first mount, DraftWorkspace may hydrate content after this component mounts.
          // If we only have an empty skeleton but upstream value now has content,
          // re-parse from value instead of preserving the stale skeleton.
          if (!hasSections || (incomingHasContent && allSectionContentEmpty)) {
            return parseMarkdownToSections(value, tpl);
          }

          return prev;
        });
      }
    }
    loadTemplate();
    return () => { active = false; };
  }, [docType, value]);

  // Extract citations dynamically from edited text to update the drawer list
  useEffect(() => {
    // Wait until template hydration populates sections; otherwise initial []
    // would serialize to "" and can clobber server-loaded draft content.
    if (!template || sections.length === 0) return;

    // Guard against stale empty skeletons when upstream value already has content.
    // Without this, the editor can overwrite a real generated draft with empty headings.
    const allSectionContentEmpty = sections.every((s) => !s.content.trim());
    if (allSectionContentEmpty && value.trim().length > 0) return;

    const handler = setTimeout(() => {
      // Serialize to get full text
      const fullText = serializeSectionsToMarkdown(sections);
      
      // Update upstream value
      if (fullText !== value) {
        onChange(fullText);
      }
      
      const matches = Array.from(fullText.matchAll(/\[CITE:([^\]]+)\]/g));
      const dynamicCitations = matches.map((match) => ({
        node_id: match[1],
        snapshot_id: "2026-05-28",
        span: [match.index!, match.index! + match[0].length] as [number, number]
      }));
      
      // Update store citations dynamically
      useDraftStore.setState({ citations: dynamicCitations });
    }, 500);

    return () => clearTimeout(handler);
  }, [sections, onChange, value]);

  const handleSectionChange = (id: string, newContent: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content: newContent } : s))
    );
  };

  const handleRemoveSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const title = e.target.value;
    if (!title) return;
    
    setSections((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, content: "", required: false },
    ]);
    // Reset select
    e.target.value = "";
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const availableSectionsToAdd = useMemo(() => {
    if (!template) return [];
    return template.allowedSections.filter(
      (as) => !sections.some((s) => s.title.toLowerCase() === as.title.toLowerCase())
    );
  }, [template, sections]);

  // Preview parsing
  const renderInline = (text: string) => {
    const regex = /(\*\*.*?\*\*|\[CITE:[^\]]+\])/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("[CITE:") && part.endsWith("]")) {
        const nodeId = part.slice(6, -1);
        const citationIdx = citations.findIndex(c => c.node_id === nodeId);
        const displayIdx = citationIdx !== -1 ? citationIdx : idx;
        return (
          <CitationBadge
            key={idx}
            nodeId={nodeId}
            index={displayIdx}
          />
        );
      }
      return part;
    });
  };

  const parseMarkdown = (markdownText: string) => {
    const paragraphs = markdownText.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Check for headers
      if (trimmed.startsWith("# ")) {
        return <h1 key={pIdx} className="text-2xl font-extrabold mb-4 mt-6 text-foreground tracking-tight border-b pb-2 font-sans break-words">{renderInline(trimmed.substring(2))}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={pIdx} className="text-xl font-bold mb-3 mt-5 text-foreground tracking-tight font-sans break-words">{renderInline(trimmed.substring(3))}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={pIdx} className="text-lg font-bold mb-2 mt-4 text-foreground tracking-tight font-sans break-words">{renderInline(trimmed.substring(4))}</h3>;
      }

      // Check for bullet lists
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const items = trimmed.split(/\n[*+-]\s+/);
        return (
          <ul key={pIdx} className="list-disc pl-6 space-y-2 mb-4 break-words">
            {items.map((item, iIdx) => (
              <li key={iIdx} className="text-foreground leading-relaxed break-words">
                {renderInline(item.replace(/^[*+-]\s+/, ""))}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={pIdx} className="text-foreground leading-relaxed mb-4 text-justify font-serif text-[15px] break-words">
          {renderInline(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className={cn("flex flex-col h-full w-full bg-background border rounded-md shadow-sm overflow-hidden", className)}>
      {/* Editor Header / Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 shrink-0">
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-muted p-0.5 rounded-lg border">
            <button
              onClick={() => setMode("preview")}
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                mode === "preview"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              {t("preview")}
            </button>
            <button
              onClick={() => setMode("edit")}
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer",
                mode === "edit"
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              {t("edit")}
            </button>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center text-xs font-medium transition-opacity duration-300">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-blue-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t("saving")}
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("savedAt", { time: lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
            </span>
          ) : (
            <span className="text-muted-foreground/50">{t("ready")}</span>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {mode === "edit" ? (
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map((section) => (
                    <DraftSection
                      key={section.id}
                      section={section}
                      onChange={handleSectionChange}
                      onRemove={handleRemoveSection}
                      isActive={activeId === section.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Section Select */}
            {availableSectionsToAdd.length > 0 && (
              <div className="flex items-center gap-2 pt-4 border-t border-dashed">
                <select
                  className="px-3 py-1.5 text-sm border rounded-md bg-transparent text-foreground outline-none focus:ring-1 focus:ring-primary"
                  onChange={handleAddSection}
                  defaultValue=""
                >
                  <option value="" disabled>+ Add Section</option>
                  {availableSectionsToAdd.map((sec) => (
                    <option key={sec.id} value={sec.title}>{sec.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-background select-text max-w-3xl mx-auto py-4 animate-in fade-in duration-200">
            <div className="prose dark:prose-invert max-w-none">
              {parseMarkdown(serializeSectionsToMarkdown(sections))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
