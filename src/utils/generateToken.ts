import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT for a user
 * @param userId - The unique identifier of the user
 * @returns JWT string that expires in 1 hour
 */
const generateToken = (userId: string) => {
  // Create a signed JWT containing the user ID as payload
  // Uses secret from environment variable
  const token = jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: "7d" } // token lifespan
  );

  return token;
};

export default generateToken;
