"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { User, Phone, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDriver } from "@/app/modules/drivers/server/hooks/use-driver";
import { DriverDocuments } from "@/app/modules/drivers/ui/components/driver-documents";
import { CompactBreadcrumb } from "@/components/ui/mobile-breadcrumb";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        isActive
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-gray-500/10 text-gray-500",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-gray-400",
        )}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
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

// Detail Row Component
function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number | React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-foreground",
          mono && "font-mono",
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// Loading Skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function DriverDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawId = searchParams.get("id") || (params.id as string);
  const driverId = rawId && rawId !== "placeholder" ? Number(rawId) : NaN;

  const {
    data: driver,
    isLoading,
    isError,
  } = useDriver(isNaN(driverId) ? 0 : driverId);

  useEffect(() => {
    if (isNaN(driverId)) {
      router.replace("/drivers");
    }
  }, [driverId, router]);

  if (isNaN(driverId) || isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <div className="p-4 rounded-full bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Driver not found
        </p>
        <Link href="/drivers">
          <Button variant="outline" size="sm">
            Go to Drivers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="p-4 space-y-2">
          <CompactBreadcrumb
            parentLabel="Drivers"
            parentHref="/drivers"
            currentLabel={`${driver.first_name} ${driver.last_name}`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">
                {driver.first_name} {driver.last_name}
              </h1>
              <StatusBadge status={driver.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-6">
        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-foreground">
                {driver.first_name} {driver.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {driver.driver_license_number}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <InfoCard
          icon={Phone}
          title="Contact Information"
          accent="bg-blue-500/10 text-blue-500"
        >
          <div className="space-y-0">
            <DetailRow label="Phone Number" value={driver.phone_number} />
            <DetailRow label="Email" value={driver.email} />
          </div>
        </InfoCard>

        {/* License Info */}
        <InfoCard
          icon={CreditCard}
          title="License Information"
          accent="bg-amber-500/10 text-amber-600"
        >
          <DetailRow
            label="License Number"
            value={driver.driver_license_number}
            mono
          />
        </InfoCard>

        {/* Documents Section */}
        <div className="pt-2">
          <DriverDocuments driverId={driver.id} />
        </div>
      </div>
    </div>
  );
}

export default function DriverDetailsClient() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DriverDetailsContent />
    </Suspense>
  );
}
