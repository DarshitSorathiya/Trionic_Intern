import type { DocumentType } from "@trionic/shared";

export type TemplateSection = {
  id: string;
  title: string;
  required: boolean;
};

export type DocumentTemplate = {
  docType: string;
  allowedSections: TemplateSection[];
  defaultSections: TemplateSection[];
};

const TEMPLATES: Record<string, DocumentTemplate> = {
  rti_application: {
    docType: "rti_application",
    allowedSections: [
      { id: "address", title: "Address", required: true },
      { id: "subject", title: "Subject", required: true },
      { id: "information_sought", title: "Information Sought", required: true },
      { id: "declaration", title: "Declaration", required: true },
    ],
    defaultSections: [
      { id: "address", title: "Address", required: true },
      { id: "subject", title: "Subject", required: true },
      { id: "information_sought", title: "Information Sought", required: true },
      { id: "declaration", title: "Declaration", required: true },
    ],
  },
  legal_notice: {
    docType: "legal_notice",
    allowedSections: [
      { id: "sender", title: "Sender", required: true },
      { id: "recipient", title: "Recipient", required: true },
      { id: "cause", title: "Cause", required: true },
      { id: "demand", title: "Demand", required: true },
      { id: "deadline", title: "Deadline", required: true },
    ],
    defaultSections: [
      { id: "sender", title: "Sender", required: true },
      { id: "recipient", title: "Recipient", required: true },
      { id: "cause", title: "Cause", required: true },
      { id: "demand", title: "Demand", required: true },
      { id: "deadline", title: "Deadline", required: true },
    ],
  },
  nda: {
    docType: "nda",
    allowedSections: [
      { id: "parties", title: "Parties", required: true },
      { id: "purpose", title: "Purpose", required: true },
      { id: "confidential_info", title: "Confidential Info", required: true },
      { id: "term", title: "Term", required: true },
      { id: "remedies", title: "Remedies", required: true },
    ],
    defaultSections: [
      { id: "parties", title: "Parties", required: true },
      { id: "purpose", title: "Purpose", required: true },
      { id: "confidential_info", title: "Confidential Info", required: true },
      { id: "term", title: "Term", required: true },
      { id: "remedies", title: "Remedies", required: true },
    ],
  },
  consumer_complaint: {
    docType: "consumer_complaint",
    allowedSections: [
      { id: "complainant", title: "Complainant", required: true },
      { id: "opposite_party", title: "Opposite Party", required: true },
      { id: "goods_service", title: "Goods/Service", required: true },
      { id: "deficiency", title: "Deficiency", required: true },
      { id: "relief", title: "Relief", required: true },
    ],
    defaultSections: [
      { id: "complainant", title: "Complainant", required: true },
      { id: "opposite_party", title: "Opposite Party", required: true },
      { id: "goods_service", title: "Goods/Service", required: true },
      { id: "deficiency", title: "Deficiency", required: true },
      { id: "relief", title: "Relief", required: true },
    ],
  },
  cheque_bounce_notice: {
    docType: "cheque_bounce_notice",
    allowedSections: [
      { id: "drawer", title: "Drawer", required: true },
      { id: "drawee", title: "Drawee", required: true },
      { id: "cheque_details", title: "Cheque Details", required: true },
      { id: "section_138_invocation", title: "Section 138 Invocation", required: true },
      { id: "demand", title: "Demand", required: true },
    ],
    defaultSections: [
      { id: "drawer", title: "Drawer", required: true },
      { id: "drawee", title: "Drawee", required: true },
      { id: "cheque_details", title: "Cheque Details", required: true },
      { id: "section_138_invocation", title: "Section 138 Invocation", required: true },
      { id: "demand", title: "Demand", required: true },
    ],
  },
  other: {
    docType: "other",
    allowedSections: [
      { id: "general", title: "General Details", required: true },
    ],
    defaultSections: [
      { id: "general", title: "General Details", required: true },
    ],
  },
};

export function getTemplate(docType: DocumentType): DocumentTemplate {
  return TEMPLATES[docType] || TEMPLATES.other;
}

/**
 * Fetch the template for a given document type.
 * Attempts to fetch from the backend API first, and falls back to hardcoded templates
 * if the backend is unavailable or returns an error.
 */
export async function fetchTemplate(docType: DocumentType): Promise<DocumentTemplate> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/document_templates?type=${docType}`);
      if (res.ok) {
        return (await res.json()) as DocumentTemplate;
      }
      console.warn(`[fetchTemplate] Backend failed to load template for ${docType}.`);
    } catch (err) {
      // Silently fall back to local template on network error or timeout
      console.warn(`[fetchTemplate] Backend unavailable for ${docType}, using fallback.`);
    }
  }

  // Fallback template
  return getTemplate(docType);
}

export type SectionData = {
  id: string; // Used for drag-and-drop sortable key
  title: string;
  content: string;
  required: boolean;
};

/**
 * Parses a markdown string into sections based on `## Section Title` headers.
 */
export function parseMarkdownToSections(
  markdown: string,
  template?: DocumentTemplate
): SectionData[] {
  if (!markdown || markdown.trim() === "") {
    if (!template) return [];
    // Return empty skeleton based on template defaults
    return template.defaultSections.map((sec) => ({
      id: crypto.randomUUID(),
      title: sec.title,
      content: "",
      required: sec.required,
    }));
  }

  // Split by `## ` keeping the header title
  const parts = markdown.split(/(?:^|\n)##\s+/);
  
  // If the first part doesn't have a header (e.g. text before any `## `)
  const sections: SectionData[] = [];
  let startIndex = 0;
  
  // parts[0] is the text before the first `## `. If it's not empty, it's a General section.
  if (parts[0] && parts[0].trim() !== "") {
    sections.push({
      id: crypto.randomUUID(),
      title: "General",
      content: parts[0].trim(),
      required: false,
    });
  }
  startIndex = 1;

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i];
    const newlineIndex = part.indexOf("\n");
    let title = part;
    let content = "";

    if (newlineIndex !== -1) {
      title = part.substring(0, newlineIndex).trim();
      content = part.substring(newlineIndex + 1).trim();
    } else {
      title = title.trim();
    }

    const templateSec = template?.allowedSections?.find(
      (s) => s.title.toLowerCase() === title.toLowerCase()
    );

    // If section is empty and not part of the current template, skip it (incorrect skeletons disappear)
    if (content === "" && !templateSec) {
      continue;
    }

    sections.push({
      id: crypto.randomUUID(),
      title,
      content,
      required: templateSec ? templateSec.required : false,
    });
  }

  // If no ## headers found at all, treat whole thing as "General" and maybe append missing template sections?
  if (sections.length === 1 && sections[0].title === "General") {
    // If we have an existing draft with no headers, we just give it a "General" section.
  }

  // Also ensure required sections from template are present, if missing, add them empty at the end.
  if (template) {
    for (const defaultSec of template.defaultSections) {
      if (!sections.some((s) => s.title.toLowerCase() === defaultSec.title.toLowerCase())) {
        sections.push({
          id: crypto.randomUUID(),
          title: defaultSec.title,
          content: "",
          required: defaultSec.required,
        });
      }
    }
  }

  return sections;
}

/**
 * Serializes an array of SectionData back to a single markdown string.
 */
export function serializeSectionsToMarkdown(sections: SectionData[]): string {
  return sections
    .filter((sec) => sec.title.trim() || sec.content.trim())
    .map((sec) => {
      // If it's a "General" section with no title, don't prepend '## General' unless explicitly wanted.
      // But standard says sections are delimited by `## `.
      if (sec.title.toLowerCase() === "general") {
        return sec.content.trim();
      }
      return `## ${sec.title}\n\n${sec.content.trim()}`;
    })
    .join("\n\n")
    .trim();
}
