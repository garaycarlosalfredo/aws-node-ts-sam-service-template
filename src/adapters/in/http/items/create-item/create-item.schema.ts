import { z } from "zod";

export const createItemBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100),
  stock: z.number().int().min(0).default(0),
});
export type CreateItemBody = z.infer<typeof createItemBodySchema>;
