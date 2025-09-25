import { z } from "zod";
import { REQUEST_STATUSES } from "../constants/request.js";

export const createRequestSchema = z.object({
  userId: z.string().uuid(),
  serviceId: z.string().uuid(),
  message: z.string().min(1),
});

export const updateRequestSchema = z.object({
  message: z.string().min(1).optional(),
  status: z.enum(REQUEST_STATUSES).optional(),
});
