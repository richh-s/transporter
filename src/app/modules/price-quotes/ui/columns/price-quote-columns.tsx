"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PriceQuote } from "@/types/price-quote";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import {
  formatLocation,
  formatTruckType,
  formatContainerSize,
  formatAxleType,
} from "@/lib/price-quote-utils";

export type PriceQuoteTableRow = PriceQuote;

function StatusBadge({ status }: { status: PriceQuoteStatusEnum }) {
  const config = {
    [PriceQuoteStatusEnum.ACTIVE]: {
      bg: "bg-primary/10",
      text: "text-primary",
      dot: "bg-primary",
    },
    [PriceQuoteStatusEnum.DRAFT]: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    [PriceQuoteStatusEnum.INACTIVE]: {
      bg: "bg-gray-500/10",
      text: "text-gray-600",
      dot: "bg-gray-400",
    },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  );
}

function ActionsCell({
  quote,
  meta,
}: {
  quote: PriceQuote;
  meta?: {
    onEdit?: (quote: PriceQuote) => void;
    onDelete?: (quote: PriceQuote) => void;
    t?: (key: string) => string;
  };
}) {
  const router = useRouter();

  return (
    <div
      className="text-right min-w-[50px] flex items-center justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-xl">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/price-quotes/placeholder?id=${quote.id}`);
            }}
            className="rounded-lg"
          >
            <Eye className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.view") || "View"}
          </DropdownMenuItem>
          {meta?.onEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta.onEdit?.(quote);
              }}
              className="rounded-lg"
            >
              <Edit className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.edit") || "Edit"}
            </DropdownMenuItem>
          )}
          {meta?.onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                meta.onDelete?.(quote);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> {meta?.t?.("list.actions.delete") || "Delete"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const priceQuoteColumns: ColumnDef<PriceQuoteTableRow>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      const { t } = useTranslation("price_quotes");
      return (
        <span
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs font-semibold uppercase tracking-wider flex items-center cursor-pointer"
        >
          {t("list.columns.id_route")}
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </span>
      );
    },
    cell: ({ row }) => {
      const quote = row.original;
      return (
        <div className="flex flex-col min-w-[150px]">
          <span className="font-bold text-sm">Quote #{quote.id}</span>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
            <span className="truncate max-w-[60px]">
              {formatLocation(quote.origin)}
            </span>
            <ChevronRight className="h-2 w-2" />
            <span className="truncate max-w-[60px]">
              {formatLocation(quote.destination)}
            </span>
          </div>
        </div>
      );
    },
    meta: { sticky: true },
  },
  {
    accessorKey: "truck_type",
    header: () => {
      const { t } = useTranslation("price_quotes");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.vehicle")}
        </span>
      );
    },
    cell: ({ row }) => {
      const quote = row.original;
      return (
        <div className="flex flex-col min-w-[100px]">
          <span className="text-xs font-medium">
            {formatTruckType(quote.truck_type)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatAxleType(quote.axle_type)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "container_size",
    header: () => {
      const { t } = useTranslation("price_quotes");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.container")}
        </span>
      );
    },
    cell: ({ row }) => (
      <span className="text-xs whitespace-nowrap">
        {formatContainerSize(row.getValue("container_size"))}
      </span>
    ),
  },
  {
    accessorKey: "gross_weight_max",
    header: () => {
      const { t } = useTranslation("price_quotes");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider text-right">
          {t("list.columns.weight")}
        </span>
      );
    },
    cell: ({ row }) => {
      const quote = row.original;
      return (
        <div className="text-right text-xs whitespace-nowrap min-w-[100px]">
          {quote.gross_weight_min.toLocaleString()} -{" "}
          {quote.gross_weight_max.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      const { t } = useTranslation("price_quotes");
      return (
        <div className="text-right">
          <span
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-semibold uppercase tracking-wider flex items-center justify-end cursor-pointer"
          >
            {t("list.columns.price")}
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </span>
        </div>
      );
    },
    cell: ({ row }) => {
      const quote = row.original;
      return (
        <div className="text-right flex flex-col min-w-[80px]">
          <span className="text-sm font-bold text-primary">
            {quote.amount.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase">
            {quote.currency}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => {
      const { t } = useTranslation("price_quotes");
      return (
        <span className="text-xs font-semibold uppercase tracking-wider">
          {t("list.columns.status")}
        </span>
      );
    },
    cell: ({ row, table }) => {
      const quote = row.original;
      const { t } = useTranslation("price_quotes");
      const meta = table.options.meta as {
        onStatusChange?: (id: number, status: PriceQuoteStatusEnum) => void;
      };

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={quote.status}
            onValueChange={(value) =>
              meta.onStatusChange?.(quote.id, value as PriceQuoteStatusEnum)
            }
          >
            <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent p-0 focus:ring-0 hover:bg-transparent">
              <StatusBadge status={quote.status} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value={PriceQuoteStatusEnum.DRAFT}>
                {t("list.stats.draft")}
              </SelectItem>
              <SelectItem value={PriceQuoteStatusEnum.ACTIVE}>
                {t("list.stats.active")}
              </SelectItem>
              <SelectItem value={PriceQuoteStatusEnum.INACTIVE}>
                {t("list.stats.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const quote = row.original;
      const meta = table.options.meta as {
        onEdit?: (quote: PriceQuote) => void;
        onDelete?: (quote: PriceQuote) => void;
        t?: (key: string) => string;
      };

      return <ActionsCell quote={quote} meta={meta} />;
    },
  },
];
