"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface MobileBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function MobileBreadcrumb({ items, className }: MobileBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide",
        className,
      )}
    >
      {/* Home */}
      <Link
        href="/"
        className="flex items-center justify-center h-7 w-7 rounded-lg bg-muted/50 hover:bg-muted transition-colors shrink-0"
      >
        <Home className="h-3.5 w-3.5 text-muted-foreground" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-muted-foreground truncate max-w-[100px]">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Compact variant for tight spaces
export function CompactBreadcrumb({
  parentLabel,
  parentHref,
  currentLabel,
  className,
}: {
  parentLabel: string;
  parentHref: string;
  currentLabel: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-xs", className)}
    >
      <Link
        href={parentHref}
        className="text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        {parentLabel}
      </Link>
      <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
      <span className="font-semibold text-foreground truncate max-w-[120px]">
        {currentLabel}
      </span>
    </nav>
  );
}
