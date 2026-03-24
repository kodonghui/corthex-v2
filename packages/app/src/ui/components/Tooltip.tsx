"use client";
// Legacy Subframe component — rewritten to remove @subframe/core dependency

import React from "react";
import { twClassNames } from "../utils";

interface TooltipRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const TooltipRoot = React.forwardRef<HTMLDivElement, TooltipRootProps>(
  function TooltipRoot({ children, className, ...otherProps }, ref) {
    return (
      <div
        className={twClassNames("flex flex-col items-start gap-2 rounded-md border border-[#283618] bg-[#283618] px-2 py-1 shadow-lg", className)}
        ref={ref}
        {...otherProps}
      >
        {children ? <span className="text-xs text-white">{children}</span> : null}
      </div>
    );
  }
);

export const Tooltip = TooltipRoot;
