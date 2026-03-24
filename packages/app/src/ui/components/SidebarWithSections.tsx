"use client";
// Legacy Subframe component — rewritten to remove @subframe/core dependency

import React from "react";
import { twClassNames } from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  selected?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(
  function NavItem({ icon, children, selected = false, rightSlot, className, ...otherProps }, ref) {
    return (
      <div
        className={twClassNames(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-neutral-50 active:bg-neutral-100",
          { "bg-[#f5f0e8] hover:bg-[#f5f0e8]": selected },
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? <span className={twClassNames("text-lg text-[#6b705c]", { "text-[#283618]": selected })}>{icon}</span> : null}
        {children ? (
          <span className={twClassNames("line-clamp-1 grow text-sm font-semibold text-[#6b705c]", { "text-[#283618]": selected })}>
            {children}
          </span>
        ) : null}
        {rightSlot ? <div className="flex items-center">{rightSlot}</div> : null}
      </div>
    );
  }
);

interface NavSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}

const NavSection = React.forwardRef<HTMLDivElement, NavSectionProps>(
  function NavSection({ children, label, className, ...otherProps }, ref) {
    return (
      <div className={twClassNames("flex w-full flex-col items-start gap-1 pt-6", className)} ref={ref} {...otherProps}>
        <div className="flex w-full flex-col items-start gap-4 px-3 py-1">
          {label ? <span className="w-full text-xs font-semibold uppercase tracking-wider text-[#908a78]">{label}</span> : null}
        </div>
        {children ? <div className="flex w-full flex-col items-start gap-1">{children}</div> : null}
      </div>
    );
  }
);

interface SidebarWithSectionsRootProps extends React.HTMLAttributes<HTMLElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const SidebarWithSectionsRoot = React.forwardRef<HTMLElement, SidebarWithSectionsRootProps>(
  function SidebarWithSectionsRoot({ header, footer, children, className, ...otherProps }, ref) {
    return (
      <nav
        className={twClassNames("flex h-full w-60 flex-col items-start border-r border-[#e5e1d3] bg-[#faf8f5]", className)}
        ref={ref}
        {...otherProps}
      >
        {header ? <div className="flex w-full flex-col items-start gap-2 px-6 py-6">{header}</div> : null}
        {children ? <div className="flex w-full grow flex-col items-start px-4 py-4 overflow-auto">{children}</div> : null}
        {footer ? <div className="flex w-full items-center gap-4 border-t border-[#e5e1d3] px-6 py-6">{footer}</div> : null}
      </nav>
    );
  }
);

export const SidebarWithSections = Object.assign(SidebarWithSectionsRoot, { NavItem, NavSection });
