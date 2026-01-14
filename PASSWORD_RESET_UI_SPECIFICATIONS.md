# Password Reset UI Specifications - shadcn/ui Components

## Overview
This document provides detailed UI/UX specifications for the Password Reset feature for authenticated users. The reset functionality will be accessible from the profile icon/dropdown menu. It includes exact component structures, layouts, and code examples using shadcn/ui components.

---

## 1. Profile Menu Integration

### Location
The password reset option should be available in the user profile dropdown menu (typically accessed via a profile icon/avatar in the top navigation bar).

### Layout Structure

```
┌─────────────────────────────────────────┐
│  [Avatar/Profile Icon] ▼               │
└─────────────────────────────────────────┘
           │
           ▼ (Click)
┌─────────────────────────────────────────┐
│  Profile Menu:                          │
│  ┌──────────────────────────────────┐  │
│  │ 👤 My Profile                    │  │
│  │ 🔒 Change Password               │  │ ← This option
│  │ ⚙️  Settings                     │  │
│  │ ──────────────────────────────── │  │
│  │ 🚪 Logout                        │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │
           ▼ (Click "Change Password")
┌─────────────────────────────────────────┐
│  Change Password Dialog                 │
│  ┌──────────────────────────────────┐  │
│  │ Change Password                  │  │
│  │ ──────────────────────────────── │  │
│  │ Current Password:                │  │
│  │ [••••••••]                       │  │
│  │                                  │  │
│  │ New Password:                    │  │
│  │ [••••••••]                       │  │
│  │                                  │  │
│  │ Confirm New Password:            │  │
│  │ [••••••••]                       │  │
│  │                                  │  │
│  │          [Cancel]  [Save Changes]│  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Required shadcn/ui Components

```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add separator
```

---

## 2. Password Reset Dialog

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Change Password                                    [×]      │
├─────────────────────────────────────────────────────────────┤
│  Enter your current password and choose a new password.      │
│                                                               │
│  Current Password *                                          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ••••••••                                    [👁] [👁] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  New Password *                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ••••••••                                    [👁] [👁] │ │
│  └───────────────────────────────────────────────────────┘ │
│  Password must be at least 8 characters long.                │
│                                                               │
│  Confirm New Password *                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ••••••••                                    [👁] [👁] │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                               │
│  ────────────────────────────────────────────────────────── │
│                                      [Cancel]  [Save Changes]│
└─────────────────────────────────────────────────────────────┘
```

### Component Code Example

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Validation schema
const passwordResetSchema = z.object({
  current_password: z.string().min(8, "Password must be at least 8 characters"),
  new_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>

interface PasswordResetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordResetDialog({
  open,
  onOpenChange,
}: PasswordResetDialogProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  async function onSubmit(data: PasswordResetFormValues) {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      
      const response = await fetch("/api/v1/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: data.current_password,
          new_password: data.new_password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to reset password")
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: result.message || "Password changed successfully",
      })

      // Reset form and close dialog
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 3. Profile Menu Component

### Component Code Example

```tsx
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordResetDialog } from "./password-reset-dialog"
import { User, Lock, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileMenuProps {
  user: {
    email: string
    full_name?: string
    avatar?: string
  }
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const router = useRouter()

  const initials = user.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user.email[0].toUpperCase()

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.full_name || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.full_name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
            <Lock className="mr-2 h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PasswordResetDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </>
  )
}
```

---

## 4. Enhanced Password Requirements (Optional)

### Advanced Validation Schema

If you want to enforce stronger password requirements in the frontend:

```tsx
const passwordResetSchema = z.object({
  current_password: z.string().min(8, "Password must be at least 8 characters"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirm_password: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
}).refine((data) => data.current_password !== data.new_password, {
  message: "New password must be different from current password",
  path: ["new_password"],
})
```

### Password Strength Indicator Component

```tsx
import { Progress } from "@/components/ui/progress"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength += 1
    if (pwd.length >= 12) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    return strength
  }

  const strength = getPasswordStrength(password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"]
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-green-600",
  ]

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Password Strength:</span>
        <span className={strength >= 4 ? "text-green-600" : strength >= 2 ? "text-yellow-600" : "text-red-600"}>
          {strengthLabels[strength - 1] || "Very Weak"}
        </span>
      </div>
      <Progress value={(strength / 6) * 100} className="h-2" />
    </div>
  )
}
```

---

## 5. Error Handling

### Error Display in Dialog

```tsx
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Inside the form, after DialogHeader:
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

### Enhanced Error Handling in onSubmit

```tsx
async function onSubmit(data: PasswordResetFormValues) {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const response = await fetch("/api/v1/auth/password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: data.current_password,
        new_password: data.new_password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 403) {
        form.setError("current_password", {
          type: "manual",
          message: "Current password is incorrect",
        })
        return
      }
      
      if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      throw new Error(result.detail || "Failed to reset password")
    }

    toast({
      title: "Success",
      description: result.message || "Password changed successfully",
    })

    form.reset()
    onOpenChange(false)
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to reset password",
      variant: "destructive",
    })
  }
}
```

---

## 6. Loading States

### Loading Button State

The form already includes loading state handling:
```tsx
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
</Button>
```

### Optional: Full Dialog Loading Overlay

```tsx
import { Loader2 } from "lucide-react"

// Inside DialogContent, add overlay:
{form.formState.isSubmitting && (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
)}
```

---

## 7. Accessibility Considerations

### Required ARIA Labels

```tsx
<Input
  type={showCurrentPassword ? "text" : "password"}
  placeholder="Enter current password"
  aria-label="Current password"
  aria-describedby="current-password-error"
  {...field}
/>
```

### Keyboard Navigation

- Dialog closes on Escape key (handled by Dialog component)
- Tab navigation through form fields (handled automatically)
- Enter key submits form (handled by form)

---

## 8. Mobile Responsiveness

### Responsive Dialog

The dialog uses `sm:max-w-[500px]` which ensures it's full-width on mobile and constrained on larger screens.

### Touch-Friendly Targets

Password visibility toggles are large enough for touch (using Button component with proper padding).

---

## 9. Installation Checklist

- [ ] Install required shadcn/ui components
- [ ] Install react-hook-form: `npm install react-hook-form`
- [ ] Install zod: `npm install zod`
- [ ] Install @hookform/resolvers: `npm install @hookform/resolvers`
- [ ] Install lucide-react for icons: `npm install lucide-react`
- [ ] Set up toast/notification system (shadcn/ui toast or similar)
- [ ] Configure API base URL
- [ ] Set up token storage (localStorage/sessionStorage)
- [ ] Add error handling utilities
- [ ] Test on mobile devices
- [ ] Test accessibility with screen readers
- [ ] Test error scenarios (wrong password, network errors, etc.)

---

## 10. Testing Recommendations

### Unit Tests
- Form validation logic
- Password strength calculation
- Error handling functions

### Integration Tests
- Dialog open/close functionality
- Form submission flow
- API integration
- Error handling scenarios

### E2E Tests
- Complete password reset flow
- Error scenarios (wrong current password, network errors)
- Success scenario with proper feedback

