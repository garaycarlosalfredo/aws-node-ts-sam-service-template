import { z } from "zod";

export const getItemPathSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});
export type GetItemPath = z.infer<typeof getItemPathSchema>;
