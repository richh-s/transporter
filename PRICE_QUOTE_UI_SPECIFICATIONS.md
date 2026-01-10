# Price Quote UI Specifications - shadcn/ui Components

## Overview
This document provides detailed UI/UX specifications for the Price Quote feature using shadcn/ui components. It includes exact component structures, layouts, and code examples.

---

## 1. Price Quotes List Page

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Price Quotes                                    [+ Create] │
├─────────────────────────────────────────────────────────────┤
│  Filters:                                                    │
│  [Origin ▼] [Destination ▼] [Status ▼] [Truck Type ▼]       │
│  [Search...]                              [Clear Filters]   │
├─────────────────────────────────────────────────────────────┤
│  Table:                                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ID │ Origin │ Destination │ Amount │ Status │ Actions │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 1  │ Addis  │ Djibouti    │ 50,000 │ Draft  │ [⋮]     │ │
│  │ 2  │ Adama  │ Hawassa     │ 75,000 │ Active │ [⋮]     │ │
│  └──────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 50                    [<] 1 2 3 [>]        │
└─────────────────────────────────────────────────────────────┘
```

### Required shadcn/ui Components

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add separator
```

### Component Code Example

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PriceQuotesList() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Price Quotes</CardTitle>
          <Button onClick={() => navigate('/price-quotes/create')}>
            + Create Quote
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addis_ababa">Addis Ababa</SelectItem>
                <SelectItem value="adama">Adama</SelectItem>
                <SelectItem value="djibouti_port">Djibouti Port</SelectItem>
                {/* ... more locations */}
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                {/* Same locations as origin */}
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search..."
              className="w-[200px]"
            />
            
            <Button variant="outline">Clear Filters</Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Weight Range (kg)</TableHead>
                <TableHead>Truck Type</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.id}</TableCell>
                  <TableCell>{formatLocation(quote.origin)}</TableCell>
                  <TableCell>{formatLocation(quote.destination)}</TableCell>
                  <TableCell>
                    {quote.gross_weight_min} - {quote.gross_weight_max}
                  </TableCell>
                  <TableCell>{formatTruckType(quote.truck_type)}</TableCell>
                  <TableCell>{formatContainerSize(quote.container_size)}</TableCell>
                  <TableCell>
                    {quote.amount.toLocaleString()} {quote.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewQuote(quote.id)}>
                          View
                        </DropdownMenuItem>
                        {quote.status === 'draft' && (
                          <DropdownMenuItem onClick={() => editQuote(quote.id)}>
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => duplicateQuote(quote.id)}>
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteQuote(quote.id)}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 2. Create Price Quote Form

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Create Price Quote                              [Cancel]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Route Information                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Origin:        [Select ▼]                           │   │
│  │ Destination:   [Select ▼]                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Cargo Details                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Min Weight (kg):  [1000        ]                    │   │
│  │ Max Weight (kg):  [20000       ]                    │   │
│  │ Truck Type:      ( ) Flatbed  ( ) Trailer          │   │
│  │ Container Size:  ( ) 20 Feet  ( ) 40 Feet          │   │
│  │ Axle Type:       [Select ▼] (Optional)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Pricing                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Amount:        [50000.00      ]                    │   │
│  │ Currency:       [ETB ▼]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [Save as Draft]  [Submit]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Required shadcn/ui Components

```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add toast
```

### Component Code Example

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  gross_weight_min: z.number().min(1, "Minimum weight must be greater than 0"),
  gross_weight_max: z.number().min(1, "Maximum weight must be greater than 0"),
  truck_type: z.enum(["flatbed", "trailer"]),
  container_size: z.enum(["twenty_feet", "forty_feet"]),
  axle_type: z.string().optional().nullable(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().max(3).default("ETB"),
}).refine((data) => data.origin !== data.destination, {
  message: "Origin and destination must be different",
  path: ["destination"],
}).refine((data) => data.gross_weight_max >= data.gross_weight_min, {
  message: "Maximum weight must be greater than or equal to minimum weight",
  path: ["gross_weight_max"],
})

const LOCATIONS = [
  { value: "addis_ababa", label: "Addis Ababa" },
  { value: "adama", label: "Adama" },
  { value: "dukem", label: "Dukem" },
  { value: "debre_zeit", label: "Debre Zeit" },
  { value: "hawassa", label: "Hawassa" },
  { value: "shashemene", label: "Shashemene" },
  { value: "djibouti_port", label: "Djibouti Port" },
]

export function CreatePriceQuoteForm() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: "ETB",
      axle_type: null,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/v1/price-quote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create quote')
      }

      toast({
        title: "Success",
        description: "Price quote created successfully",
      })
      
      // Navigate to quote detail or list
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Price Quote</CardTitle>
          <CardDescription>
            Fill in the details to create a new price quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Route Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origin</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOCATIONS.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LOCATIONS.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Cargo Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cargo Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gross_weight_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 1000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gross_weight_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 20000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="truck_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Truck Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="flatbed" id="flatbed" />
                            <Label htmlFor="flatbed">Flatbed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="trailer" id="trailer" />
                            <Label htmlFor="trailer">Trailer</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="container_size"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Container Size</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-row space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="twenty_feet" id="twenty_feet" />
                            <Label htmlFor="twenty_feet">20 Feet</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="forty_feet" id="forty_feet" />
                            <Label htmlFor="forty_feet">40 Feet</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="axle_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Axle Type (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                        defaultValue={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select axle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="triple">Triple</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 50000.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ETB">ETB</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating..." : "Create Quote"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 3. Price Quote Detail Page

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Price Quote #1                              [Edit] [Delete] │
├─────────────────────────────────────────────────────────────┤
│  Status: [Draft Badge]                                       │
│  Created: Jan 15, 2024                                       │
├─────────────────────────────────────────────────────────────┤
│  Route Information                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Origin:        Addis Ababa                          │   │
│  │ Destination:   Djibouti Port                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Cargo Details                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Weight Range:    1,000 - 20,000 kg                  │   │
│  │ Truck Type:      Flatbed                            │   │
│  │ Container Size:  20 Feet                            │   │
│  │ Axle Type:       Double                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  Pricing                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Amount:         50,000.00 ETB                       │   │
│  │ Currency:       ETB                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Code Example

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function PriceQuoteDetail({ quoteId }: { quoteId: number }) {
  const { data: quote, isLoading } = usePriceQuote(quoteId)

  if (isLoading) return <div>Loading...</div>
  if (!quote) return <div>Quote not found</div>

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Price Quote #{quote.id}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Created: {formatDate(quote.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusVariant(quote.status)}>
              {quote.status}
            </Badge>
            {quote.status === 'draft' && (
              <Button onClick={() => navigate(`/price-quotes/${quote.id}/edit`)}>
                Edit
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the quote.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteQuote(quote.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Route Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-medium">{formatLocation(quote.origin)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{formatLocation(quote.destination)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cargo Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Cargo Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Weight Range</p>
                <p className="font-medium">
                  {quote.gross_weight_min.toLocaleString()} - {quote.gross_weight_max.toLocaleString()} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Truck Type</p>
                <p className="font-medium">{formatTruckType(quote.truck_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Container Size</p>
                <p className="font-medium">{formatContainerSize(quote.container_size)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Axle Type</p>
                <p className="font-medium">
                  {quote.axle_type ? formatAxleType(quote.axle_type) : "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">
                  {quote.amount.toLocaleString()} {quote.currency}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 4. Edit Price Quote Form

### Component Code Example

```tsx
// Similar to CreatePriceQuoteForm but:
// 1. Pre-populate form with existing quote data
// 2. Use PUT endpoint instead of POST
// 3. Only allow editing if status is "draft"
// 4. Show warning if trying to edit non-draft quote

export function EditPriceQuoteForm({ quoteId }: { quoteId: number }) {
  const { data: quote } = usePriceQuote(quoteId)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: quote ? {
      origin: quote.origin,
      destination: quote.destination,
      gross_weight_min: quote.gross_weight_min,
      gross_weight_max: quote.gross_weight_max,
      truck_type: quote.truck_type,
      container_size: quote.container_size,
      axle_type: quote.axle_type,
      amount: quote.amount,
      currency: quote.currency,
    } : undefined,
  })

  if (quote?.status !== 'draft') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cannot Edit</AlertTitle>
        <AlertDescription>
          Only draft quotes can be edited. This quote is {quote.status}.
        </AlertDescription>
      </Alert>
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Use PUT /api/v1/price-quote/{id}
    // Similar to create but with PUT method
  }

  // Same form structure as CreatePriceQuoteForm
}
```

---

## 5. Delete Confirmation Dialog

### Required Component

```bash
npx shadcn-ui@latest add alert-dialog
```

### Component Code Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteQuoteDialog({ quoteId, onDelete }: { quoteId: number, onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the price quote
            and remove all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              await deleteQuote(quoteId)
              onDelete()
            }}
            className="bg-destructive text-destructive-foreground"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## 6. Utility Functions

### Enum Conversion Helpers

```tsx
// Convert API enum values to display names
export function formatLocation(location: string): string {
  const map: Record<string, string> = {
    'addis_ababa': 'Addis Ababa',
    'adama': 'Adama',
    'dukem': 'Dukem',
    'debre_zeit': 'Debre Zeit',
    'hawassa': 'Hawassa',
    'shashemene': 'Shashemene',
    'djibouti_port': 'Djibouti Port',
  }
  return map[location] || location
}

export function formatTruckType(truckType: string): string {
  const map: Record<string, string> = {
    'flatbed': 'Flatbed',
    'trailer': 'Trailer',
  }
  return map[truckType] || truckType
}

export function formatContainerSize(size: string): string {
  const map: Record<string, string> = {
    'twenty_feet': '20 Feet',
    'forty_feet': '40 Feet',
  }
  return map[size] || size
}

export function formatAxleType(axleType: string): string {
  const map: Record<string, string> = {
    'single': 'Single',
    'double': 'Double',
    'triple': 'Triple',
  }
  return map[axleType] || axleType
}

// Convert display names to API enum values
export function locationToApi(location: string): string {
  const map: Record<string, string> = {
    'Addis Ababa': 'addis_ababa',
    'Adama': 'adama',
    'Dukem': 'dukem',
    'Debre Zeit': 'debre_zeit',
    'Hawassa': 'hawassa',
    'Shashemene': 'shashemene',
    'Djibouti Port': 'djibouti_port',
  }
  return map[location] || location
}

// Status badge variant
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    'draft': 'secondary',
    'active': 'default',
    'expired': 'destructive',
  }
  return variants[status] || 'outline'
}
```

---

## 7. Required shadcn/ui Components Summary

Install all components with:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add alert
```

---

## 8. Form Validation Schema

```tsx
import * as z from "zod"

export const priceQuoteSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  gross_weight_min: z.number().min(1, "Minimum weight must be greater than 0"),
  gross_weight_max: z.number().min(1, "Maximum weight must be greater than 0"),
  truck_type: z.enum(["flatbed", "trailer"], {
    required_error: "Truck type is required",
  }),
  container_size: z.enum(["twenty_feet", "forty_feet"], {
    required_error: "Container size is required",
  }),
  axle_type: z.enum(["single", "double", "triple"]).optional().nullable(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  currency: z.string().max(3).default("ETB"),
}).refine((data) => data.origin !== data.destination, {
  message: "Origin and destination must be different",
  path: ["destination"],
}).refine((data) => data.gross_weight_max >= data.gross_weight_min, {
  message: "Maximum weight must be greater than or equal to minimum weight",
  path: ["gross_weight_max"],
})
```

---

## 9. Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function PriceQuotesListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 10. Error Handling

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ErrorDisplay({ error }: { error: Error | string }) {
  const message = typeof error === 'string' ? error : error.message
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
```

---

## 11. Toast Notifications

```tsx
import { useToast } from "@/components/ui/use-toast"

export function usePriceQuoteToast() {
  const { toast } = useToast()

  return {
    success: (message: string) => {
      toast({
        title: "Success",
        description: message,
      })
    },
    error: (message: string) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    },
  }
}
```

---

## 12. Responsive Design

All components should be responsive:

```tsx
// Mobile: Stack vertically
// Tablet: 2 columns
// Desktop: Full layout

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

---

## 13. Accessibility

- All form fields have proper labels
- Use `aria-required` for required fields
- Provide `aria-describedby` for error messages
- Keyboard navigation support
- Screen reader friendly

---

## 14. Color Scheme

Use shadcn/ui default theme with customizations:

- **Primary**: Default shadcn/ui primary color
- **Success**: Green for active quotes
- **Warning**: Yellow for draft quotes
- **Destructive**: Red for errors and delete actions
- **Muted**: Gray for optional fields and secondary text

---

This document provides complete UI specifications for implementing the Price Quote feature using shadcn/ui components. Follow these specifications to ensure consistency and proper implementation.

