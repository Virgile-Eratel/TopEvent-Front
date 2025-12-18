import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<typeof Button>

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      variant={isActive ? "outline" : "ghost"}
      size="icon"
      className={className}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Aller à la page précédente"
      size="default"
      className={cn("gap-1 pl-2.5", className)}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span>Précédent</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Aller à la page suivante"
      size="default"
      className={cn("gap-1 pr-2.5", className)}
      {...props}
    >
      <span>Suivant</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Plus de pages</span>
    </span>
  )
}

type PaginationPageSizeProps = {
  value: number
  onValueChange: (value: number) => void
  options?: number[]
  label?: string
} & Omit<React.ComponentProps<"div">, "onChange">

function PaginationPageSize({
  value,
  onValueChange,
  options = [10, 20, 50],
  label = "Éléments par page",
  className,
  ...props
}: PaginationPageSizeProps) {
  return (
    <div
      data-slot="pagination-page-size"
      className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      <span className="whitespace-nowrap">{label}</span>
      <Select
        value={String(value)}
        onValueChange={(v) => {
          const parsed = Number.parseInt(v, 10)
          if (!Number.isNaN(parsed)) onValueChange(parsed)
        }}
      >
        <SelectTrigger className="h-9 w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationPageSize,
}

