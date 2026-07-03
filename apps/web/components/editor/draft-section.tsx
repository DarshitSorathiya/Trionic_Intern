import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionData } from "@/lib/document-templates";

interface DraftSectionProps {
  section: SectionData;
  onChange: (id: string, newContent: string) => void;
  onRemove?: (id: string) => void;
  isActive?: boolean;
}

export function DraftSection({
  section,
  onChange,
  onRemove,
  isActive = false,
}: DraftSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex flex-col bg-card border rounded-lg shadow-sm transition-all duration-200",
        isDragging && "opacity-50 scale-[1.02] shadow-xl z-50 ring-2 ring-primary",
        isActive && !isDragging && "ring-1 ring-primary/50"
      )}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b rounded-t-lg group">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            type="button"
            className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-muted rounded"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          
          <h3 className="font-medium text-sm text-foreground">
            {section.title}
            {section.required && <span className="text-destructive ml-1">*</span>}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          {!section.required && onRemove && (
            <button
              onClick={() => onRemove(section.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              title="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-3">
        <textarea
          value={section.content}
          onChange={(e) => onChange(section.id, e.target.value)}
          placeholder={`Enter content for ${section.title}...`}
          className="w-full min-h-[100px] resize-y bg-transparent outline-none font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:ring-0"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
