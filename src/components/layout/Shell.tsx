"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  // ClipboardList, // Unused - orders page not implemented
  Tag,
  // CreditCard, // Unused - payments page not implemented
  Menu,
  Users, // For Driver Management
  // User, // Removed - My Profile menu item removed
  // Settings, // Removed - Settings menu item removed
  LogOut,
  Satellite,
  FileText,
  Lock,
  Anchor,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordResetDialog } from "@/components/profile/password-reset-dialog";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Shipments", href: "/ships", icon: Anchor },
  { name: "Fleet Management", href: "/fleet", icon: Truck },
  { name: "Driver Management", href: "/drivers", icon: Users },
  { name: "GPS Device Management", href: "/gps-devices", icon: Satellite },
  // { name: "Active Orders", href: "/orders", icon: ClipboardList }, // Page not implemented yet
  { name: "Biweekly Quotes", href: "/price-quotes", icon: Tag },
  // { name: "Payments", href: "/payments", icon: CreditCard }, // Page not implemented yet
  { name: "POD Documents", href: "/transporter/pod-documents", icon: FileText },
  {
    name: "Organization Documents",
    href: "/organization/documents",
    icon: ShieldCheck,
  },
];

export function Sidebar({
  className,
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground pt-16 lg:pt-0 border-r border-sidebar-border",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <Image
            src="https://www.wetruck.ai/images/logo.png"
            alt="WeTruck Logo"
            width={120}
            height={32}
            className="h-8 object-contain"
          />
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4 py-4">
        {navigation.map((item) => {
          // Check if pathname matches the href or starts with it (for nested routes)
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-bold transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground",
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    logout();
    router.push("/sign-in");
    setShowLogoutDialog(false);
  };

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-[100] lg:hidden",
          sidebarOpen ? "visible" : "invisible",
        )}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/50 transition-opacity duration-300 ease-linear",
            sidebarOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-72 transform transition duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col lg:pl-72 overflow-x-hidden min-h-screen">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8 pt-[env(safe-area-inset-top,0)] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-x-2 text-sm font-medium hover:text-primary transition-colors outline-none cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase text-xs">
                      {user?.name?.[0] || "T"}
                    </div>
                    <span className="hidden lg:inline">Profile</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setPasswordDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogoutClick}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Logout</DialogTitle>
              <DialogDescription className="py-4">
                Are you sure you want to log out? You will need to login again
                to access your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmLogout}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <PasswordResetDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
        />

        <main className="flex-1 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] px-4 sm:px-6 lg:px-8 lg:py-8 lg:pb-8 overflow-x-hidden overflow-y-auto min-h-0">
          <div className="mx-auto max-w-7xl overflow-x-hidden overflow-y-visible">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 border-t border-border backdrop-blur-md lg:hidden pb-[env(safe-area-inset-bottom,0)] pl-[env(safe-area-inset-left,0)] pr-[env(safe-area-inset-right,0)]">
          <div className="flex justify-around items-center h-16 min-h-[56px]">
            {navigation.slice(0, 4).map((item) => {
              // Show only first 4 items on mobile
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-[10px] font-medium leading-none">
                    {item.name.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
