import crypto from "crypto";
import bcrypt from "bcryptjs";
import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import { resend } from "@/src/lib/resend";

export const resolvers = {
    Mutation: {
        // 1. Request Password Reset Link (Sends Email)
        forgetPassword: async (_: any, { workEmail }: { workEmail: string }) => {
            // Validate Input
            if (!workEmail) {
                throw new Error("Work email is required.");
            }

            await connectDB();

            // Find Business
            const business = await Business.findOne({ workEmail });
            if (!business) {
                // Return generic message for security (prevents account enumeration)
                return {
                    success: true,
                    message: "If an account with that email exists, a password reset link has been generated.",
                };
            }

            // Generate plain token for URL, hash it for DB storage
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

            business.resetPasswordToken = hashedToken;
            business.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour validity

            await business.save();

            const resetUrl = `http://localhost:3000/resetnewpasswordlink?token=${resetToken}`;

            try {
                await resend.emails.send({
                    from: "onboarding@resend.dev", // Replace with verified domain in production
                    to: workEmail,
                    subject: "Password Reset Request",
                    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #065f46;">Reset Your Password</h2>
              <p>Hi ${business.ownerName || 'there'},</p>
              <p>You requested to reset your password for <strong>${business.businessName || 'BusinessHub'}</strong>. Click the button below to set a new password:</p>
              <p style="margin: 24px 0;">
                <a href="${resetUrl}" style="background-color: #065f46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
                });
            } catch (emailError: any) {
                console.error("Failed to send reset email:", emailError);
                throw new Error("Failed to send reset email. Please try again later.");
            }

            console.log("Password Reset URL:", resetUrl);

            return {
                success: true,
                message: "If an account with that email exists, a password reset link has been generated.",
            };
        },

        // 2. Process Token & Set New Password
        resetForgotPassword: async (
            _: any,
            { token, newPassword }: { token: string; newPassword: string }
        ) => {
            if (!token || !newPassword) {
                throw new Error("Token and new password are required.");
            }

            if (newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters long.");
            }

            await connectDB();

            // Hash incoming plain token from URL to match hashed version in MongoDB
            const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

            // Find business record matching token and ensure it hasn't expired
            const business = await Business.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: new Date() },
            });

            if (!business) {
                throw new Error("Invalid or expired password reset token.");
            }

            // Hash new password
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            business.password = await bcrypt.hash(newPassword, saltRounds);

            // Invalidate the reset token
            business.resetPasswordToken = undefined;
            business.resetPasswordExpires = undefined;

            await business.save();

            return {
                success: true,
                message: "Password reset successful! You can now log in with your new password.",
            };
        },
    },
};