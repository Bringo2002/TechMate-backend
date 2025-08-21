import prisma from "../prismaClient";

/**
 * Get a user's profile by their ID.
 * Only returns public/profile-relevant fields.
 */
export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,  // optional profile picture
      bio: true,        // optional short description
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

/**
 * Update a user's profile.
 * Accepts optional fields (name, avatarUrl, bio).
 */
export const updateUserProfile = async (
  userId: string,
  data: { name?: string; avatarUrl?: string; bio?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};
