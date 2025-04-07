// pages/api/user/complete-onboarding.js
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../lib/mongoose';
import User from '../../../models/user';
import mongoose from 'mongoose'; // Keep mongoose import for CastError check

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.userId) {
    console.warn("Complete Onboarding API: Unauthorized - userId missing from token", token);
    return res.status(401).json({ message: 'Unauthorized: No valid user ID found in session' });
  }

  const userId = token.userId;

  // --- DEBUGGING LOGS --- 
  console.log('[DEBUG] typeof mongoose:', typeof mongoose);
  console.log('[DEBUG] mongoose object keys:', mongoose ? Object.keys(mongoose) : 'mongoose is null/undefined');
  console.log('[DEBUG] typeof mongoose.Types:', typeof mongoose?.Types);
  console.log('[DEBUG] typeof mongoose.ObjectId:', typeof mongoose?.ObjectId);
  // --- END DEBUGGING LOGS ---

  // REMOVED the ObjectId.isValid check as it was causing persistent TypeErrors
  // Relying on [...nextauth].js callbacks to ensure token.userId is a valid ObjectId string.
  // The try/catch below will handle CastError if an invalid ID still gets through somehow.

  try {
    await connectDB();

    // Find the user by their MongoDB _id and update the flag
    const result = await User.updateOne(
      { _id: userId, hasCompletedOnboarding: { $ne: true } }, // Use the correct userId (MongoDB _id)
      { $set: { hasCompletedOnboarding: true } }
    );

    if (result.matchedCount === 0) {
      // This could mean user not found OR onboarding was already complete
      const userExists = await User.findById(userId).select('_id').lean(); // Use lean() for existence check
      if (!userExists) {
        console.warn(`Complete Onboarding API: User not found for ID: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
      // If user exists, it means onboarding was already done
      console.log(`Complete Onboarding API: Onboarding was already complete for user: ${userId}`);
      return res.status(200).json({ message: 'Onboarding already completed' });
    }

    // Redundant check given the $ne, but keep for safety?
    // if (result.modifiedCount === 0 && result.matchedCount === 1) {
    //   console.log(`Complete Onboarding API: Onboarding already completed (no change needed) for user: ${userId}`);
    //   return res.status(200).json({ message: 'Onboarding already completed (no change needed)' });
    // }

    console.log(`Complete Onboarding API: Onboarding marked as completed for user: ${userId}`);
    return res.status(200).json({ message: 'Onboarding marked as completed' });

  } catch (error) {
    console.error(`Complete Onboarding API: Error for user ${userId}:`, error);
    // Still check for CastError in case something unexpected happens
    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: `Invalid user ID format encountered during DB operation: ${userId}` });
    }
    return res.status(500).json({ message: 'Internal Server Error updating onboarding status' });
  }
}

export default handler;