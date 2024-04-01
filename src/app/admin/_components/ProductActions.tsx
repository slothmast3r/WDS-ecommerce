"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useTransition } from "react"
import { deleteProduct, toggleProductAvailability } from "../_actions/product"
import { useRouter } from "next/navigation"

export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
}: {
  id: string
  isAvailableForPurchase: boolean
}) {
  const [isPending, startTransistion] = useTransition()
  const router = useRouter()
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransistion(async () => {
          await toggleProductAvailability(id, !isAvailableForPurchase)
          router.refresh()
        })
      }}
    >
      {isPending
        ? "Loading..."
        : isAvailableForPurchase
        ? "Deactivate"
        : "Activate"}
    </DropdownMenuItem>
  )
}

export function DeleteDropdownItem({
  id,
  disabled,
}: {
  id: string
  disabled: boolean
}) {
  const [isPending, startTransistion] = useTransition()
  const router = useRouter()

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || isPending}
      onClick={() => {
        startTransistion(async () => {
          await deleteProduct(id)
        })
        router.refresh()
      }}
    >
      {isPending ? "Loading..." : "Delete"}
    </DropdownMenuItem>
  )
}
