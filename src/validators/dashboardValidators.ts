// ======================================
// FILE: src/validators/dashboardValidators.ts
// ======================================
import { z } from "zod";
import { TimeBucket } from "../types/dashboard.js";


const isoDateString = z
.string()
.datetime({ offset: false })
.or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)); // allow YYYY-MM-DD


export const rangeQuerySchema = z
.object({
from: isoDateString.optional(),
to: isoDateString.optional(),
bucket: z.enum(["day", "week", "month"]).optional(),
limit: z.coerce.number().int().positive().max(100).optional(),
})
.transform((q) => {
const to = q.to ? new Date(q.to) : new Date();
const from = q.from ? new Date(q.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
const bucket: TimeBucket = (q.bucket as TimeBucket) ?? "day";
const limit = q.limit ?? 12;


if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
throw new Error("Invalid date range");
}
if (from > to) {
throw new Error("`from` cannot be after `to`");
}
return { from, to, bucket, limit };
});


export type RangeQuery = z.infer<typeof rangeQuerySchema>;