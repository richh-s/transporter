"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  ClipboardList,
  Tag,
  CreditCard,
  Menu,
  User,
  Settings,
  LogOut,
  Bell,
  Satellite,
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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Fleet Management", href: "/fleet", icon: Truck },
  { name: "Driver Management", href: "/drivers", icon: User },
  { name: "GPS Device Management", href: "/gps-devices", icon: Satellite },
  { name: "Active Orders", href: "/orders", icon: ClipboardList },
  { name: "Biweekly Quotes", href: "/quotes", icon: Tag },
  { name: "Payments", href: "/payments", icon: CreditCard },
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
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6">
        <Image
          src="/images/welogo.png"
          alt="WeTruck Logo"
          width={120}
          height={32}
          className="h-8 w-auto object-contain filter-[sepia(1)_saturate(5)_hue-rotate(5deg)_brightness(1.1)]"
        />
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
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
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground"
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
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/50 transition-opacity duration-300 ease-linear",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-72 transform transition duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col lg:pl-72 overflow-x-hidden overflow-y-hidden h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold md:text-xl text-brand-primary truncate uppercase tracking-tight">
                <span className="">WeTruck</span>
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              <button className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-6 w-px bg-border lg:block" aria-hidden="true" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-x-2 text-sm font-medium hover:text-brand-primary transition-colors outline-none cursor-pointer">
                    <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold uppercase text-xs">
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
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
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

        <main className="flex-1 pt-6 pb-24 px-4 sm:px-6 lg:px-8 lg:py-8 lg:pb-8 overflow-x-hidden overflow-y-hidden h-full">
          <div className="mx-auto max-w-7xl overflow-x-hidden overflow-y-hidden h-full">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 border-t border-border backdrop-blur-md lg:hidden">
          <div className="flex justify-around items-center h-16">
            {navigation.map((item) => {
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
                      : "text-muted-foreground hover:text-foreground"
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
