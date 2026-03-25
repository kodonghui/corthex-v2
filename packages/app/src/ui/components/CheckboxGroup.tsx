"use client";
// Legacy Subframe component — rewritten to remove @subframe/core dependency

import React from "react";
import { twClassNames } from "../utils";

interface CheckboxGroupRootProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  helpText?: React.ReactNode;
  error?: boolean;
  horizontal?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const CheckboxGroupRoot = React.forwardRef<HTMLDivElement, CheckboxGroupRootProps>(
  function CheckboxGroupRoot({ label, helpText, error = false, horizontal = false, children, className, ...otherProps }, ref) {
    return (
      <div className={twClassNames("flex flex-col items-start gap-2", className)} ref={ref} {...otherProps}>
        {label ? <span className="text-sm font-semibold text-corthex-text-primary">{label}</span> : null}
        {children ? (
          <div className={twClassNames("flex flex-col items-start gap-2", { "flex-row flex-nowrap gap-6": horizontal })}>
            {children}
          </div>
        ) : null}
        {helpText ? (
          <span className={twClassNames("text-xs text-corthex-text-secondary", { "text-red-600": error })}>{helpText}</span>
        ) : null}
      </div>
    );
  }
);

export const CheckboxGroup = CheckboxGroupRoot;
