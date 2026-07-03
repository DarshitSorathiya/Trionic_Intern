import { create } from "zustand";
import type { Document, Citation, DocumentType } from "@trionic/shared";

interface DraftStore {
  // Document state
  document: Document | null;
  content: string;
  citations: Citation[];
  
  // UI State
  isCitationDrawerOpen: boolean;
  activeCitationNodeId: string | null;
  
  // Actions
  setDocument: (doc: Document, content: string, citations: Citation[]) => void;
  setContent: (content: string) => void;
  toggleCitationDrawer: () => void;
  setActiveCitationNodeId: (nodeId: string | null) => void;
  updateDocType: (docType: DocumentType) => void;
}

export const useDraftStore = create<DraftStore>((set) => ({
  document: null,
  content: "",
  citations: [],
  isCitationDrawerOpen: true,
  activeCitationNodeId: null,

  setDocument: (doc, content, citations) => 
    set({ document: doc, content, citations }),
    
  setContent: (content) => 
    set({ content }),
    
  toggleCitationDrawer: () => 
    set((state) => ({ isCitationDrawerOpen: !state.isCitationDrawerOpen })),

  setActiveCitationNodeId: (nodeId) =>
    set({ activeCitationNodeId: nodeId }),

  updateDocType: (docType) =>
    set((state) => ({
      document: state.document ? { ...state.document, doc_type: docType } : null,
    })),
}));
