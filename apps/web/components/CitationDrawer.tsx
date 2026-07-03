"use client"

import * as React from "react"
import { Citation } from "@trionic/shared"
import { parseNodeId, formatNodeIdToBreadcrumb, getHumanBreadcrumb } from "@/lib/citation-utils"
import { Scale, Bookmark, Pin, Info } from "lucide-react"

// Complete dictionary of highly realistic legal texts for Week 2 (to be replaced by live fetch in Week 3)
const MOCK_NODE_TEXTS: Record<string, { title: string; text: string; details?: string }> = {
  'IPC-1860/CH-XVI/S-375': {
    title: 'Section 375: Rape',
    text: 'A man is said to commit "rape" who, except in the case hereinafter excepted, has sexual intercourse with a woman under circumstances falling under any of the seven following descriptions: (First) - Against her will. (Second) - Without her consent...',
    details: 'Indian Penal Code, 1860 | Chapter XVI: Of Offences Affecting The Human Body'
  },
  'RTI-2005/CH-II/S-6': {
    title: 'Section 6: Request for obtaining information',
    text: 'A person, who desires to obtain any information under this Act, shall make a request in writing or through electronic means in English or Hindi or in the official language of the area in which the application is being made, accompanying such fee as may be prescribed...',
    details: 'Right to Information Act, 2005 | Chapter II: Right to Information and Obligations of Public Authorities'
  },
  'RTI-2005/CH-II/S-7': {
    title: 'Section 7: Disposal of request',
    text: 'Subject to the proviso to sub-section (2) of section 5 or the proviso to sub-section (3) of section 6, the Public Information Officer on receipt of a request under section 6 shall, as expeditiously as possible, and in any case within thirty days of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request...',
    details: 'Right to Information Act, 2005 | Chapter II: Right to Information and Obligations of Public Authorities'
  },
  'ICA-1872/CH-VI/S-73': {
    title: 'Section 73: Compensation for loss or damage caused by breach of contract',
    text: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it...',
    details: 'Indian Contract Act, 1872 | Chapter VI: Of The Consequences Of Breach Of Contract'
  },
  'CPA-2019/CH-IV/S-35': {
    title: 'Section 35: Manner in which complaint shall be made',
    text: 'A complaint, in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided, may be filed with a District Commission by— (a) the consumer; (b) any recognised consumer association; (c) one or more consumers, where there are numerous consumers having the same interest...',
    details: 'Consumer Protection Act, 2019 | Chapter IV: Consumer Disputes Redressal Commission'
  }
};

const DEFAULT_TEXT = {
  title: 'Legal Section Text',
  text: 'Full legal text will be fetched dynamically from the PageIndex in Week 3. Hovering confirms the layout matches perfectly.',
  details: 'Act details not indexed.'
};

export interface CitationDrawerProps {
  citations: Citation[]
  activeCitationNodeId?: string | null
  onCitationSelect?: (nodeId: string, index: number) => void
}

// Tree Node Interface for nested hierarchical data structure
interface TreeNode {
  id: string
  label: string
  level: number
  children: TreeNode[]
  citationIndex?: number
  citation?: Citation
}

export function CitationDrawer({
  citations = [],
  activeCitationNodeId = null,
  onCitationSelect
}: CitationDrawerProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [activeTileId, setActiveTileId] = React.useState<string | null>(null)
  const [hoveredTooltipNodeId, setHoveredTooltipNodeId] = React.useState<string | null>(null)

  // Cache for dynamic legal texts fetched from PageIndex (falling back to mock)
  const [nodeTexts, setNodeTexts] = React.useState<Record<string, any>>({})
  const [loadingNodes, setLoadingNodes] = React.useState<Record<string, boolean>>({})

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
            text: data.text || "Legal text content not found.",
            act_name: data.act_name,
            number: data.number,
            snapshot_id: data.snapshot_id
          }
        }));
      } else {
        throw new Error("Proxy fetch failed");
      }
    } catch (err) {
      // Local fallback to MOCK_NODE_TEXTS
      const mockText = MOCK_NODE_TEXTS[nodeId] || DEFAULT_TEXT;
      const parsed = parseNodeId(nodeId);
      setNodeTexts(prev => ({
        ...prev,
        [nodeId]: {
          title: mockText.title || formatNodeIdToBreadcrumb(nodeId),
          text: mockText.text,
          act_name: parsed.actName,
          number: parsed.sectionCode ? parsed.sectionCode.replace('S-', '') : parsed.chapterCode.replace('S-', ''),
          snapshot_id: "2024-12-01"
        }
      }));
    } finally {
      setLoadingNodes(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  // Prefetch metadata for all citations
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
            label: "Explanation",
            level: 3,
            children: [],
            citationIndex: idx,
            citation
          });
        }
      } else {
        // No Chapter: Act -> Section -> Detail
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
            label: "Explanation",
            level: 2,
            children: [],
            citationIndex: idx,
            citation
          });
        }
      }
    });

    return rootNodes;
  }, [citations, nodeTexts]);

  // Compute Word Count and Density Info (sandbox estimates 350 words if body is not direct)
  const densityInfo = React.useMemo(() => {
    const wordCount = 350;
    const density = citations.length / wordCount;
    if (density === 0) return { text: "No Citations", color: "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-700" };
    if (density < 0.01) return { text: "Low Density", color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/50" };
    if (density <= 0.03) return { text: "Medium Density", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-450 border-amber-200 dark:border-amber-900/50" };
    return { text: "High Density", color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/50" };
  }, [citations.length]);

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
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  }

  const handleSectionClick = (node: TreeNode) => {
    toggleNode(node.id);
    setActiveTileId(node.id);
    
    const explanationNode = node.children[0];
    if (explanationNode && explanationNode.citation) {
      const origIndex = explanationNode.citationIndex ?? 0;
      const nodeIdStr = explanationNode.citation.node_id;

      if (onCitationSelect) {
        onCitationSelect(nodeIdStr, origIndex);
      }

      const markerId = `citation-marker-${origIndex + 1}`;
      const markerElement = document.getElementById(markerId);
      if (markerElement) {
        markerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    if (node.level === 1) indentClass = "pl-4 border-l border-slate-200/55 dark:border-slate-800/40 ml-2";
    if (node.level === 2) indentClass = "pl-6 border-l border-slate-200/55 dark:border-slate-800/40 ml-2";
    if (node.level === 3) indentClass = "pl-8 border-l border-emerald-250/30 dark:border-emerald-950/20 ml-2";

    // Level 3 details block (Explanation) or leaf explanation
    if (node.id.endsWith('/DETAIL')) {
      const nodeId = node.citation?.node_id || "";
      const textInfo = nodeTexts[nodeId];
      const isLoading = loadingNodes[nodeId];

      return (
        <div key={node.id} className={`${indentClass} py-1 pr-1`}>
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 shadow-sm select-text text-left space-y-2 animate-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5 text-[9.5px] text-slate-400 font-mono font-bold">
              <span>LEGAL TEXT SUMMARY</span>
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                [{node.citationIndex! + 1}]
              </span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2 font-sans">
                <span className="h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Loading authoritative text...
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-300 font-sans">
                {textInfo?.text || "Expand parent or hover badge to fetch full text."}
              </p>
            )}

            <div className="text-[9.5px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-850 font-mono leading-none">
              {getHumanBreadcrumb(nodeId, textInfo)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={node.id} className="space-y-1.5 relative">
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
          className={`group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${indentClass} ${
            isActive
              ? 'bg-indigo-50/40 dark:bg-indigo-950/15 text-indigo-650 dark:text-indigo-450 font-semibold'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {node.level === 0 && <Bookmark className="size-3.5 text-indigo-500/80 shrink-0" />}
            <span className={`truncate ${
              node.level === 0 
                ? 'font-bold text-slate-800 dark:text-slate-200 text-sm'
                : node.level === 1 && !node.citation
                ? 'font-semibold text-[12.5px]'
                : 'font-medium text-xs font-serif'
            }`}>
              {node.label}
            </span>
          </div>

          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 select-none">
            {isExpanded ? '▼' : '►'}
          </span>
        </div>

        {/* Custom Premium Tooltip for Snapshot Date */}
        {hoveredTooltipNodeId === node.id && node.citation && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-medium font-mono rounded shadow-xl pointer-events-none whitespace-nowrap border border-slate-800 dark:border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            as of {node.citation.snapshot_id || "2024-12-01"}
          </div>
        )}

        {/* Child level render */}
        {isExpanded && (
          <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-80 h-full flex flex-col bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200 text-base">
            Citations ({citations.length})
          </h2>
          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border ${densityInfo.color} select-none`}>
            {densityInfo.text}
          </span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          Hierarchy
        </span>
      </div>

      {/* Citations Nested Tree */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {citations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
            <Bookmark className="size-8 stroke-[1.5]" />
            <p className="text-sm">No citations in this draft yet</p>
          </div>
        ) : (
          treeNodes.map(rootNode => renderTreeNode(rootNode))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10.5px] flex items-center gap-2">
        <Info className="size-4 shrink-0 text-indigo-500" />
        <span>Click elements to expand hierarchy. Clicking Section scrolls editor.</span>
      </div>
    </aside>
  )
}
