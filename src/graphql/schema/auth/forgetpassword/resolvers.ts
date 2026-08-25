import crypto from "crypto";
import bcrypt from "bcryptjs";
import Business from "@/src/app/model/signup.model";
import { Staff } from "@/src/app/model/staffRole.model";
import { connectDB } from "@/src/lib/connect";
import { resend } from "@/src/lib/resend";

export const resolvers = {
    Mutation: {
        // 1. Request Password Reset Link (Sends Email)
        forgetPassword: async (_: any, { workEmail }: { workEmail: string }) => {
            const inputEmail = (workEmail || "").trim().toLowerCase();

            if (!inputEmail) {
                throw new Error("Email address is required.");
            }

            await connectDB();

            // Find either Business Owner or Staff account (case-insensitive)
            let account: any = await Business.findOne({
                workEmail: { $regex: new RegExp(`^${inputEmail}$`, "i") },
            });
            let isStaff = false;

            if (!account) {
                account = await Staff.findOne({
                    email: { $regex: new RegExp(`^${inputEmail}$`, "i") },
                });
                if (account) {
                    isStaff = true;
                }
            }

            if (!account) {
                // Generic security message
                return {
                    success: true,
                    message: "If an account with that email exists, a password reset link has been sent.",
                };
            }

            // Generate plain token for URL, hash it for DB storage
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

            account.resetPasswordToken = hashedToken;
            account.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour validity
            await account.save();

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const resetUrl = `${appUrl}/resetnewpasswordlink?token=${resetToken}`;
            const recipientName = isStaff ? account.fullName : (account.ownerName || account.businessName || "User");
            const senderEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

            console.log(`[Auth] Password reset token generated for ${inputEmail}. Reset URL: ${resetUrl}`);

            try {
                const { data, error } = await resend.emails.send({
                    from: senderEmail,
                    to: inputEmail,
                    subject: "Reset Your BusinessHub Password",
                    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #065f46; margin-top: 0;">Reset Your Password</h2>
              <p>Hi ${recipientName},</p>
              <p>You requested to reset your password for your <strong>BusinessHub NG</strong> account. Click the button below to choose a new password:</p>
              <p style="margin: 28px 0;">
                <a href="${resetUrl}" style="background-color: #065f46; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
              </p>
              <p style="font-size: 13px; color: #666; line-height: 1.5;">
                Or copy and paste this link in your browser:<br/>
                <a href="${resetUrl}" style="color: #065f46; word-break: break-all;">${resetUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="font-size: 12px; color: #888; margin: 0;">This reset link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
            </div>
          `,
                });

                if (error) {
                    console.error("[Resend API Error]:", error);
                    throw new Error(`Email delivery failed: ${error.message}`);
                }

                console.log("[Resend Email Sent Successfully]:", data);
            } catch (emailError: any) {
                console.error("[Failed to send reset email]:", emailError);
                throw new Error(emailError.message || "Failed to send password reset email. Please verify your email configuration.");
            }

            return {
                success: true,
                message: "A password reset link has been sent to your email address.",
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

            // Find matching account (Business or Staff)
            let account: any = await Business.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: new Date() },
            });

            if (!account) {
                account = await Staff.findOne({
                    resetPasswordToken: hashedToken,
                    resetPasswordExpires: { $gt: new Date() },
                });
            }

            if (!account) {
                throw new Error("Invalid or expired password reset token.");
            }

            // Hash new password
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            account.password = await bcrypt.hash(newPassword, saltRounds);

            // Invalidate the reset token
            account.resetPasswordToken = undefined;
            account.resetPasswordExpires = undefined;

            await account.save();

            return {
                success: true,
                message: "Password reset successful! You can now log in with your new password.",
            };
        },
    },
};