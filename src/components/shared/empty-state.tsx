import React from "react";
import { FolderSearch } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <FolderSearch size={26} />;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function") {
      const IconComponent = icon as React.ComponentType<{ size?: number; className?: string }>;
      return <IconComponent size={26} />;
    }
    return icon as React.ReactNode;
  };

  return (
    <div
      className={`card p-10 sm:p-14 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 border-dashed border-[var(--border-color)] ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-400 border border-[var(--primary)]/20 flex items-center justify-center mb-4 shadow-sm">
        {renderIcon()}
      </div>

      <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mb-6">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
