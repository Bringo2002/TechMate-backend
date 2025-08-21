import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IServiceRequest } from "../models/requestModel.js";
import { createRequestSchema, updateRequestSchema } from "../validators/requestValidator.js";

// Create a new service request
export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createRequestSchema.parse(req.body);

    const newRequest = await prisma.serviceRequest.create({
      data: {
        ...parsed,
        status: "PENDING", // always default to PENDING
      },
    });

    res.status(201).json(newRequest as IServiceRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(400).json({ message: "Invalid request data", error });
  }
};

// Get all requests
export const getRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    const requests = await prisma.serviceRequest.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { createdAt: "desc" },
    });

    res.json(requests as IServiceRequest[]);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Failed to get requests", error });
  }
};

// Update request status or details
export const updateRequest = async (req: Request, res: Response): Promise<Response> => {
  try {
    const parsed = updateRequestSchema.parse(req.body);
    const { id } = req.params;

    // Ensure status is one of the valid enum values
    if (parsed.status && !["PENDING", "APPROVED", "REJECTED"].includes(parsed.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: parsed,
    });

    return res.json(updatedRequest as IServiceRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(400).json({ message: "Invalid update data", error });
  }
};


// Delete a request
export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.serviceRequest.delete({ where: { id } });
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Failed to delete request", error });
  }
};
