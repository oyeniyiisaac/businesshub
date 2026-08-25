import mongoose from "mongoose";

/**
 * Normalizes businessId into a Mongoose query condition matching both
 * string and ObjectId representations in MongoDB.
 */
export const toBusinessQuery = (businessId?: string | mongoose.Types.ObjectId | null) => {
  if (!businessId) return null;
  const idStr = businessId.toString().trim();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    return { $in: [idStr, new mongoose.Types.ObjectId(idStr)] };
  }
  return idStr;
};

/**
 * Extracts and asserts the businessId from the GraphQL auth context.
 * Throws an Unauthorized error if the businessId is missing.
 */
export const requireBusinessId = (context: any): string => {
  const businessId = context?.user?.businessId;
  if (!businessId) {
    throw new Error("Unauthorized: Please log in to perform this action.");
  }
  return businessId.toString().trim();
};
