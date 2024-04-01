"use server"

import db from "@/db/db"
import { z } from "zod"

import fs from "fs/promises"
import { notFound, redirect } from "next/navigation"
const fileSchema = z.instanceof(File, { message: "File must be a File object" })
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/"),
  "Must be an image"
)

const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  // file: fileSchema.refine((file) => file.size > 0, "Required"),
  // image: imageSchema.refine((file) => file.size > 0, "Required"),
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function addProduct(prevstate: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }
  const data = result.data

  let filePath: string | undefined
  let imagePath: string | undefined

  if (data.file) {
    await fs.mkdir("products", { recursive: true })
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }

  if (data.image) {
    await fs.mkdir("public/products", { recursive: true })
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    )
  }

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })
  redirect("/admin/products")
}
const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
})

export async function update(
  id: string,
  prevstate: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }
  const data = result.data
  const product = await db.product.findUnique({ where: { id } })
  if (product == null) return notFound()

  let filePath = product.filePath
  if (data.file != null && data.file.size > 0 && product.filePath) {
    await fs.unlink(product.filePath)
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }
  let imagePath = product.imagePath

  if (data.image != null && data.image.size > 0 && product.imagePath) {
    await fs.unlink(`public${product.imagePath}`)

    await fs.mkdir("public/products", { recursive: true })
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    )
  }

  await db.product.update({
    where: { id },
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })
  redirect("/admin/products")
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  })
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } })
  if (product == null) {
    return notFound()
  }
  if (product.filePath) {
    await fs.unlink(product.filePath)
  }
  if (product.imagePath) {
    await fs.unlink(`public${product.imagePath}`)
  }
}
