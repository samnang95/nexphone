import { z } from "zod";

export const comparePhonesSchema = z.object({
  productIds: z
    .array(z.string().trim().min(1, "Product ID cannot be empty"))
    .min(2, "At least 2 phones must be provided for comparison")
    .max(4, "A maximum of 4 phones can be compared simultaneously"),
  highlightDifferences: z.boolean().default(false).optional(),
});

export const queryCompareSchema = z.object({
  ids: z.string().trim().optional(),
  highlightDifferences: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => val === true || val === "true")
    .optional(),
});

export type ComparePhonesInput = z.infer<typeof comparePhonesSchema>;
export type QueryCompareInput = z.infer<typeof queryCompareSchema>;
