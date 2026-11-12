import { z } from "zod";

export const removeItemStockPathSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});
export const removeItemStockBodySchema = z.object({
  amount: z.number().int().positive(),
});
export type RemoveItemStockRequest = z.infer<typeof removeItemStockPathSchema> &
  z.infer<typeof removeItemStockBodySchema>;
