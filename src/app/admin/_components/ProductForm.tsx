"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { useState } from "react"
import { addProduct } from "../_actions/product"
import { useFormState, useFormStatus } from "react-dom"
import { Product } from "@prisma/client"
import Image from "next/image"

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, action] = useFormState(addProduct, {})
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents || 0
  )
  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error?.name && <div className="text-destructive"> {error.name} </div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          defaultValue={product?.priceInCents || undefined}
          onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
        />
        {error?.priceInCents && (
          <div className="text-destructive"> {error.priceInCents} </div>
        )}

        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          defaultValue={product?.description || ""}
          name="description"
          required
        />
        {error?.description && (
          <div className="text-destructive"> {error.description} </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input type="file" id="file" name="file" />
        {product != null && product.filePath && (
          <div className="text-muted-foreground">{product.filePath}</div>
        )}
        {error?.file && <div className="text-destructive"> {error.file} </div>}
      </div>{" "}
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" />

        {product != null && product.imagePath && (
          <Image
            alt="Product Image"
            width="400"
            height="400"
            src={product.imagePath}
          />
        )}
        {error?.image && (
          <div className="text-destructive"> {error.image} </div>
        )}
      </div>
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  )
}
