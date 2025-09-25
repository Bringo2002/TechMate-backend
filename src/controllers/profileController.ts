import { Request, Response } from "express";
import { getUserProfile, updateUserProfile } from "../services/profileService";
import { z } from "zod";
import prisma from "../prismaClient.js";

/**
 * -------------------------------
 * Zod schema for validating profile updates
 * -------------------------------
 */
const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * Get the logged-in user's profile
 * @route GET /api/profile
 */
export const getProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.id;

    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error });
  }
};

/**
 * Update the logged-in user's profile
 * @route PUT /api/profile
 */
export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    // Validate incoming data with Zod
    const parsedData = updateProfileSchema.parse(req.body);

    const userId = req.user.id;

    // Optional: prevent updating someone else's profile (already safe if using req.user.id)
    // if (req.user.id !== targetUserId) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // Update only fields that are provided
    const updatedProfile = await updateUserProfile(userId, parsedData);

    res.json(updatedProfile);
  } catch (error) {
    // Zod validation errors will also be caught here
    res.status(400).json({ message: "Failed to update profile", error });
  }
};

/**
 * Upload / update user's avatar
 * @route POST /api/profile/avatar
 * Note: This snippet should go in your routes file with proper middleware (protect + upload)
 */
export const uploadAvatar = async (req: Request & { user?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });

    res.json({ avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload avatar", error });
  }
};
