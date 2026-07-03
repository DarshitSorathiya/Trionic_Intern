"use client";

import * as React from "react";
import { X, BookOpenText, Info, Bookmark } from "lucide-react";
import { useDraftStore } from "../../hooks/use-draft-store";
import { parseNodeId, formatNodeIdToBreadcrumb, getHumanBreadcrumb } from "@/lib/citation-utils";
import type { Citation } from "@trionic/shared";
import { useTranslations } from "next-intl";

interface TreeNode {
  id: string;
  label: string;
  level: number;
  children: TreeNode[];
  citationIndex?: number;
  citation?: Citation;
}

export function CitationDrawer() {
  const citations = useDraftStore((state) => state.citations);
  const content = useDraftStore((state) => state.content);
  const activeCitationNodeId = useDraftStore((state) => state.activeCitationNodeId);
  const setActiveCitationNodeId = useDraftStore((state) => state.setActiveCitationNodeId);
  const toggleCitationDrawer = useDraftStore((state) => state.toggleCitationDrawer);

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [activeTileId, setActiveTileId] = React.useState<string | null>(null);
  const [hoveredTooltipNodeId, setHoveredTooltipNodeId] = React.useState<string | null>(null);

  // Cache for dynamic legal texts fetched from PageIndex
  const [nodeTexts, setNodeTexts] = React.useState<Record<string, any>>({});
  const [loadingNodes, setLoadingNodes] = React.useState<Record<string, boolean>>({});

  const t = useTranslations("draft");
  // Fetch page index text for a given node id
  const fetchNodeText = async (nodeId: string) => {
    if (nodeTexts[nodeId] || loadingNodes[nodeId]) return;
    setLoadingNodes(prev => ({ ...prev, [nodeId]: true }));
    try {
      const res = await fetch(`/api/pageindex/node/${encodeURIComponent(nodeId)}`);
      if (res.ok) {
        const data = await res.json();
        setNodeTexts(prev => ({
          ...prev,
          [nodeId]: {
            title: data.title || formatNodeIdToBreadcrumb(nodeId),
            text: data.text || t("legalTextNotFound"),
            act_name: data.act_name,
            number: data.number,
            snapshot_id: data.snapshot_id
          }
        }));
      } else {
        setNodeTexts(prev => ({
          ...prev,
          [nodeId]: {
            title: formatNodeIdToBreadcrumb(nodeId),
            text: t("failedToFetchNode")
          }
        }));
      }
    } catch (err) {
      console.error("[CitationDrawer] Fetch error:", err);
      setNodeTexts(prev => ({
        ...prev,
        [nodeId]: {
          title: formatNodeIdToBreadcrumb(nodeId),
          text: t("errorConnecting")
        }
      }));
    } finally {
      setLoadingNodes(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  // Prefetch metadata for all citations in the draft
  React.useEffect(() => {
    citations.forEach(citation => {
      fetchNodeText(citation.node_id);
    });
  }, [citations]);

  // Build the hierarchical tree path dynamically from citation node IDs, grouped by Act
  const treeNodes = React.useMemo(() => {
    const rootNodes: TreeNode[] = [];

    citations.forEach((citation, idx) => {
      const parts = citation.node_id.split('/');
      const actCode = parts[0]?.split('-')[0] || parts[0];
      const meta = nodeTexts[citation.node_id];
      const parsed = parseNodeId(citation.node_id);

      // Level 0: Act Node
      let actNode = rootNodes.find(n => n.id === actCode);
      if (!actNode) {
        actNode = {
          id: actCode,
          label: meta?.act_name || parsed.actName || actCode,
          level: 0,
          children: []
        };
        rootNodes.push(actNode);
      } else if (meta?.act_name && actNode.label === actCode) {
        actNode.label = meta.act_name;
      }

      if (parts.length >= 3) {
        // Has Chapter and Section: Act -> Chapter -> Section -> Detail
        const chapterId = `${parts[0]}/${parts[1]}`;
        let chapterNode = actNode.children.find(n => n.id === chapterId);
        if (!chapterNode) {
          chapterNode = {
            id: chapterId,
            label: parsed.chapterName || "General",
            level: 1,
            children: []
          };
          actNode.children.push(chapterNode);
        }

        const sectionId = `${parts[0]}/${parts[1]}/${parts[2]}`;
        let sectionNode = chapterNode.children.find(n => n.id === sectionId);
        if (!sectionNode) {
          const secNum = meta?.number || parts[2].replace('S-', '');
          const secTitle = meta?.title || parsed.sectionName;
          const cleanTitle = secTitle ? secTitle.replace(/\.$/, '').trim() : '';
          const sectionLabel = cleanTitle ? `Section ${secNum} (${cleanTitle})` : `Section ${secNum}`;

          sectionNode = {
            id: sectionId,
            label: sectionLabel,
            level: 2,
            children: [],
            citationIndex: idx,
            citation
          };
          chapterNode.children.push(sectionNode);
        }

        const detailId = `${citation.node_id}/DETAIL`;
        const hasDetail = sectionNode.children.find(n => n.id === detailId);
        if (!hasDetail) {
          sectionNode.children.push({
            id: detailId,
            label: t("explanation"),
            level: 3,
            children: [],
            citationIndex: idx,
            citation
          });
        }
      } else {
        // No Chapter: Act -> Section -> Detail (direct 2-part path)
        const sectionId = `${parts[0]}/${parts[1]}`;
        let sectionNode = actNode.children.find(n => n.id === sectionId);
        if (!sectionNode) {
          const secNum = meta?.number || parts[1].replace('S-', '');
          const secTitle = meta?.title || parsed.sectionName;
          const cleanTitle = secTitle ? secTitle.replace(/\.$/, '').trim() : '';
          const sectionLabel = cleanTitle ? `Section ${secNum} (${cleanTitle})` : `Section ${secNum}`;

          sectionNode = {
            id: sectionId,
            label: sectionLabel,
            level: 1,
            children: [],
            citationIndex: idx,
            citation
          };
          actNode.children.push(sectionNode);
        }

        const detailId = `${citation.node_id}/DETAIL`;
        const hasDetail = sectionNode.children.find(n => n.id === detailId);
        if (!hasDetail) {
          sectionNode.children.push({
            id: detailId,
            label: t("explanation"),
            level: 2,
            children: [],
            citationIndex: idx,
            citation
          });
        }
      }
    });

    return rootNodes;
  }, [citations, nodeTexts, t]);

  // Compute Word Count and Density Info
  const wordCount = React.useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const densityInfo = React.useMemo(() => {
    const density = wordCount > 0 ? citations.length / wordCount : 0;
    if (density === 0) return { text: "No Citations", color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" };
    if (density < 0.01) return { text: "Low Density", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-755 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50" };
    if (density <= 0.03) return { text: "Medium Density", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-755 dark:text-amber-400 border-amber-200 dark:border-amber-900/50" };
    return { text: "High Density", color: "bg-rose-50 dark:bg-rose-950/40 text-rose-755 dark:text-rose-450 border-rose-200 dark:border-rose-900/50" };
  }, [citations.length, wordCount]);

  // Automatically unfold the parent branch chain when activeCitationNodeId changes
  React.useEffect(() => {
    if (activeCitationNodeId) {
      const parts = activeCitationNodeId.split('/');
      const actId = parts[0]?.split('-')[0] || parts[0];
      
      const newExpanded: Record<string, boolean> = { ...expanded };
      
      if (parts.length >= 3) {
        const chapterId = `${parts[0]}/${parts[1]}`;
        const sectionId = `${parts[0]}/${parts[1]}/${parts[2]}`;
        setActiveTileId(sectionId);
        newExpanded[actId] = true;
        newExpanded[chapterId] = true;
        newExpanded[sectionId] = true;
      } else {
        const sectionId = `${parts[0]}/${parts[1]}`;
        setActiveTileId(sectionId);
        newExpanded[actId] = true;
        newExpanded[sectionId] = true;
      }
      
      setExpanded(newExpanded);
      fetchNodeText(activeCitationNodeId);
      
      setTimeout(() => {
        const targetId = parts.length >= 3 ? `${parts[0]}/${parts[1]}/${parts[2]}` : `${parts[0]}/${parts[1]}`;
        const elementId = `node-tile-${targetId}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
          element.classList.add("ring-2", "ring-indigo-500/50", "bg-indigo-50/50", "dark:bg-indigo-950/20");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-indigo-500/50", "bg-indigo-50/50", "dark:bg-indigo-950/20");
          }, 1500);
        }
      }, 150);
    }
  }, [activeCitationNodeId]);

  const toggleNode = (nodeId: string) => {
    setExpanded(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleSectionClick = (node: TreeNode) => {
    toggleNode(node.id);
    setActiveTileId(node.id);
    
    const explanationNode = node.children[0];
    if (explanationNode && explanationNode.citation) {
      const origIndex = explanationNode.citationIndex ?? 0;
      const nodeIdStr = explanationNode.citation.node_id;

      setActiveCitationNodeId(nodeIdStr);
      fetchNodeText(nodeIdStr);

      const markerId = `citation-marker-${origIndex + 1}`;
      const markerElement = document.getElementById(markerId);
      if (markerElement) {
        markerElement.scrollIntoView({ behavior: "smooth", block: "center" });
        markerElement.classList.add("ring-4", "ring-indigo-500/50", "bg-indigo-100", "dark:bg-indigo-900/40");
        setTimeout(() => {
          markerElement.classList.remove("ring-4", "ring-indigo-500/50", "bg-indigo-100", "dark:bg-indigo-900/40");
        }, 2000);
      }
    }
  };

  // Recursive tree renderer function
  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = !!expanded[node.id];
    const isActive = activeTileId === node.id;

    // Nested indentation based on hierarchy level
    let indentClass = "pl-0";
    if (node.level === 1) indentClass = "pl-4 border-l border-zinc-200/55 dark:border-zinc-800/40 ml-2";
    if (node.level === 2) indentClass = "pl-6 border-l border-zinc-200/55 dark:border-zinc-800/40 ml-2";
    if (node.level === 3) indentClass = "pl-8 border-l border-indigo-200/30 dark:border-indigo-950/20 ml-2";

    // Level 3 details block (Explanation) or leaf explanation
    if (node.id.endsWith('/DETAIL')) {
      const nodeId = node.citation?.node_id || "";
      const textInfo = nodeTexts[nodeId];
      const isLoading = loadingNodes[nodeId];

      return (
        <div key={node.id} className={`${indentClass} py-1.5 pr-1`}>
          <div className="bg-background border rounded-xl p-3 shadow-sm select-text text-left space-y-2 animate-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between border-b pb-1.5 text-[9.5px] text-muted-foreground font-mono font-bold">
              <span>{t("authoritativeText")}</span>
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                [{node.citationIndex! + 1}]
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 font-sans">
                <span className="h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                {t("loading")}
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-foreground font-sans">
                {textInfo?.text || t("expandParent")}
              </p>
            )}

            <div className="text-[9.5px] text-muted-foreground pt-1.5 border-t font-mono leading-normal">
              {getHumanBreadcrumb(nodeId, textInfo)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={node.id} className="space-y-1 relative">
        {/* Accordion Node Header */}
        <div
          id={`node-tile-${node.id}`}
          role="button"
          tabIndex={0}
          onMouseEnter={() => {
            if (node.citation) setHoveredTooltipNodeId(node.id);
          }}
          onMouseLeave={() => {
            if (node.citation) setHoveredTooltipNodeId(null);
          }}
          onClick={() => {
            if (node.citation) {
              handleSectionClick(node);
            } else {
              toggleNode(node.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (node.citation) {
                handleSectionClick(node);
              } else {
                toggleNode(node.id);
              }
            }
          }}
          className={`group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${indentClass} ${
            isActive
              ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 font-semibold'
              : 'hover:bg-muted text-foreground hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {node.level === 0 && <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" />}
            <span className={`truncate ${
              node.level === 0 
                ? 'font-bold text-sm'
                : node.level === 1 && !node.citation
                ? 'font-semibold text-xs text-muted-foreground'
                : 'font-medium text-xs font-serif'
            }`}>
              {node.label}
            </span>
          </div>

          <span className="text-[10px] text-muted-foreground font-mono shrink-0 select-none">
            {isExpanded ? '▼' : '►'}
          </span>
        </div>

        {/* Custom Premium Tooltip for Snapshot Date */}
        {hoveredTooltipNodeId === node.id && node.citation && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-medium font-mono rounded shadow-xl pointer-events-none whitespace-nowrap border border-slate-800 dark:border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            as of {node.citation.snapshot_id || "2024-12-01"}
          </div>
        )}

        {/* Child recursion */}
        {isExpanded && (
          <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-card shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.08)] ring-1 ring-border/50 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/30 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">{t("citations")} ({citations.length})</h2>
          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${densityInfo.color} select-none`}>
            {densityInfo.text}
          </span>
        </div>
        <button 
          onClick={toggleCitationDrawer}
          className="rounded-md p-1.5 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {citations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4 text-center py-12">
            <div className="rounded-full bg-primary/10 p-4">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-[250px]">
              <h3 className="font-semibold tracking-tight text-foreground">
                {t("noCitationsFound")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("addCitationMarkers")}
              </p>
              {useDraftStore.getState().document?.doc_type === "rti_application" && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                  Hint: Try citing the <strong>RTI Act, 2005</strong>.
                </p>
              )}
              {useDraftStore.getState().document?.doc_type === "cheque_bounce_notice" && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium bg-indigo-50 dark:bg-indigo-950/30 p-2 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                  Hint: Try citing <strong>Negotiable Instruments Act, Section 138</strong>.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {treeNodes.map(rootNode => renderTreeNode(rootNode))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t bg-muted/20 text-muted-foreground text-[10px] flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span>{t("clickPathsToExpand")}</span>
      </div>
    </div>
  );
}
