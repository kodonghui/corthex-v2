"use client";
// Legacy Subframe component — rewritten to remove @subframe/core dependency

import React from "react";
import { twClassNames } from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  function Item({ active = false, disabled = false, icon = null, children, className, ...otherProps }, ref) {
    return (
      <div
        className={twClassNames(
          "flex h-10 cursor-pointer items-center justify-center gap-2 border-b border-corthex-border px-2.5 py-0.5",
          { "border-b-2 border-x-0 border-t-0 border-corthex-accent px-2.5 pt-0.5 pb-px": active },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? <span className={twClassNames("text-sm text-corthex-text-secondary", { "text-corthex-text-secondary": disabled, "text-corthex-accent-deep": active })}>{icon}</span> : null}
        {children ? (
          <span className={twClassNames("text-sm font-semibold text-corthex-text-secondary", { "text-corthex-text-secondary": disabled, "text-corthex-accent-deep": active })}>
            {children}
          </span>
        ) : null}
      </div>
    );
  }
);

interface TabsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(
  function TabsRoot({ children, className, ...otherProps }, ref) {
    return (
      <div className={twClassNames("flex w-full items-end", className)} ref={ref} {...otherProps}>
        {children ? <div className="flex items-start self-stretch">{children}</div> : null}
        <div className="flex grow flex-col items-start gap-2 self-stretch border-b border-corthex-border" />
      </div>
    );
  }
);

export const Tabs = Object.assign(TabsRoot, { Item });
