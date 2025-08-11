import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.serviceRequest.findMany();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get requests', error });
  }
};
