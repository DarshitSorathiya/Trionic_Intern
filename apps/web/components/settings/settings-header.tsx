import React from "react";

interface SettingsHeaderProps {
  title: string;
  description?: string;
}

export function SettingsHeader({ title, description }: SettingsHeaderProps) {
  return (
    <div className="space-y-1 pb-6 border-b border-border mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl leading-snug">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground leading-normal max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
