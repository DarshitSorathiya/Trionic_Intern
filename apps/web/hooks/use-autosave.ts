import { useState, useEffect, useCallback, useRef } from "react";

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface UseAutosaveProps {
  documentId: string;
  value: string;
  debounceMs?: number;
}

/**
 * A highly reusable hook that manages debounced autosaving for any text value.
 * Strictly decoupled from global state.
 */
export function useAutosave({ documentId, value, debounceMs = 1500 }: UseAutosaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Track the last value that was successfully saved to prevent redundant network calls
  const lastSavedValue = useRef<string>(value);

  const triggerSave = useCallback(async (contentToSave: string) => {
    if (!documentId) return;
    
    // Safety check: don't patch if it's identical to what the DB already has
    if (contentToSave === lastSavedValue.current) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");



    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body_markdown: contentToSave }),
      });

      if (!response.ok) {
        if (response.status === 409) {
          // Version conflict from concurrent autosave requests. Keep unsaved state
          // and let the next debounce cycle retry with the latest content.
          setSaveStatus("unsaved");
          return;
        }

        const details = await response.text().catch(() => "");
        throw new Error(
          `Failed to save document. Status: ${response.status}${details ? ` — ${details}` : ""}`
        );
      }

      lastSavedValue.current = contentToSave;
      setLastSavedAt(new Date());
      setSaveStatus("saved");
    } catch (error) {
      console.error("[useAutosave] Error:", error);
      setSaveStatus("error");
    }
  }, [documentId]);

  // Debounced effect to watch for value changes and trigger the save
  useEffect(() => {
    // Fast exit if the value hasn't actually changed from the DB state
    if (value === lastSavedValue.current) {
      if (saveStatus === "unsaved") setSaveStatus("saved");
      return;
    }

    // Immediately reflect that the user has unsaved edits
    setSaveStatus("unsaved");

    // Start the debounce timer
    const handler = setTimeout(() => {
      triggerSave(value);
    }, debounceMs);

    // Cleanup: clears the timer if the value changes (i.e. user keeps typing)
    // before the 1500ms delay finishes.
    return () => clearTimeout(handler);
  }, [value, debounceMs, triggerSave, saveStatus]);

  return {
    saveStatus,
    lastSavedAt,
    triggerSave,
  };
}
