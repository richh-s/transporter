"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Trash2,
  Edit,
  MapPin,
  Truck,
  Scale,
  Package,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePriceQuote,
  useDeletePriceQuote,
} from "@/app/modules/price-quotes/server/hooks";
import { PriceQuoteStatusEnum } from "@/types/price-quote";
import {
  formatLocation,
  formatTruckType,
  formatContainerSize,
  formatAxleType,
} from "@/lib/price-quote-utils";
import { DeleteQuoteDialog } from "@/app/modules/price-quotes/ui/components";
import { cn } from "@/lib/utils";

// Status Badge Component
function StatusBadge({ status }: { status: PriceQuoteStatusEnum }) {
  const config = {
    [PriceQuoteStatusEnum.ACTIVE]: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {status}
    </span>
  );
}

// Info Card Component
function InfoCard({
  icon: Icon,
  title,
  children,
  accent = "bg-primary/10 text-primary",
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/30">
        <div className={cn("p-1.5 rounded-lg", accent)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Loading Skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function PriceQuoteDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (params.id as string);
  const id = rawId && rawId !== "placeholder" ? Number(rawId) : NaN;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: quote, isLoading, error } = usePriceQuote(isNaN(id) ? 0 : id);
  const deleteMutation = useDeletePriceQuote();

  useEffect(() => {
    if (isNaN(id)) {
      router.replace("/price-quotes");
    }
  }, [id, router]);

  if (isNaN(id)) {
    return <DetailSkeleton />;
  }

  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return "—";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", ETB: "ETB " };
    return `${symbols[currency] || ""}${amount.toLocaleString()}`;
  };

  const handleDeleteConfirm = () => {
    if (quote) {
      deleteMutation.mutate(quote.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          router.push("/price-quotes");
        },
      });
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <div className="p-4 rounded-full bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Failed to load quote
        </p>
        <Link href="/price-quotes">
          <Button variant="outline" size="sm">
            Go to Quotes
          </Button>
        </Link>
      </div>
    );
  }

  if (!quote) return null;

  const canEdit =
    quote.status === PriceQuoteStatusEnum.DRAFT ||
    quote.status === PriceQuoteStatusEnum.INACTIVE;

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="p-4 space-y-2">
          <CompactBreadcrumb
            parentLabel="Price Quotes"
            parentHref="/price-quotes"
            currentLabel={`Quote #${quote.id}`}
          />
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Quote #{quote.id}</h1>
                <StatusBadge status={quote.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatLocation(quote.origin)} →{" "}
                {formatLocation(quote.destination)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Price Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(quote.amount, quote.currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {quote.currency}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Route Card */}
        <InfoCard
          icon={MapPin}
          title="Route"
          accent="bg-red-500/10 text-red-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-primary border-2 border-primary/30" />
              <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-muted-foreground/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground border-2 border-muted-foreground/30" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Origin
                </p>
                <p className="text-sm font-semibold">
                  {formatLocation(quote.origin)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Destination
                </p>
                <p className="text-sm font-semibold">
                  {formatLocation(quote.destination)}
                </p>
              </div>
            </div>
          </div>
        </InfoCard>

        {/* Truck & Container Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Truck className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Truck
              </span>
            </div>
            <p className="text-sm font-semibold">
              {formatTruckType(quote.truck_type)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatAxleType(quote.axle_type)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Package className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Container
              </span>
            </div>
            <p className="text-sm font-semibold">
              {formatContainerSize(quote.container_size)}
            </p>
          </div>
        </div>

        {/* Weight Range */}
        <InfoCard
          icon={Scale}
          title="Weight Range"
          accent="bg-amber-500/10 text-amber-600"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Minimum
              </p>
              <p className="text-lg font-bold">
                {quote.gross_weight_min.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Maximum
              </p>
              <p className="text-lg font-bold">
                {quote.gross_weight_max.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
          </div>
        </InfoCard>

        {/* Timeline */}
        <InfoCard
          icon={Calendar}
          title="Created"
          accent="bg-gray-500/10 text-gray-600"
        >
          <p className="text-sm font-medium">
            {formatDateTime(quote.created_at)}
          </p>
        </InfoCard>
      </div>

      {/* Fixed Bottom Actions */}
      {canEdit && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50 flex gap-3">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/price-quotes/placeholder/edit?id=${quote.id}`)
            }
            className="flex-1 rounded-xl h-11"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="rounded-xl h-11"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <DeleteQuoteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        quote={quote}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export function PriceQuoteDetailView() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PriceQuoteDetailContent />
    </Suspense>
  );
}
