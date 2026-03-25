"use client";
// Legacy Subframe component — rewritten to remove @subframe/core dependency

import React from "react";
import { twClassNames } from "../utils";

interface FullscreenDialogRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const FullscreenDialogRoot = React.forwardRef<HTMLDivElement, FullscreenDialogRootProps>(
  function FullscreenDialogRoot({ children, className, open, onOpenChange, ...otherProps }, ref) {
    if (!open && open !== undefined) return null;
    return children ? (
      <div
        className={twClassNames("fixed inset-0 z-50 flex h-full w-full flex-col items-start bg-corthex-surface", className)}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const FullscreenDialog = FullscreenDialogRoot;
