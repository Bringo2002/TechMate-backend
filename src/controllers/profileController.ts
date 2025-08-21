import { Request, Response } from "express";
import { getUserProfile, updateUserProfile } from "../services/profileService";

/**
 * Get the logged-in user's profile.
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
 * Update the logged-in user's profile.
 * @route PUT /api/profile
 */
export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, avatarUrl, bio } = req.body;

    // Update only fields that are provided
    const updatedProfile = await updateUserProfile(userId, { name, avatarUrl, bio });

    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
};
