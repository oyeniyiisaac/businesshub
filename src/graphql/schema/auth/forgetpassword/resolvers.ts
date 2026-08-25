import crypto from "crypto";
import bcrypt from "bcryptjs";
import Business from "@/src/app/model/signup.model";
import { Staff } from "@/src/app/model/staffRole.model";
import { connectDB } from "@/src/lib/connect";
import { resend } from "@/src/lib/resend";

export const resolvers = {
    Mutation: {
        // 1. Request Password Reset OTP (Sends 6-digit Code to Email)
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
                // Return generic message for security
                return {
                    success: true,
                    message: "If an account with that email exists, a verification code has been sent.",
                };
            }

            // Generate 6-digit numeric OTP and security tokens
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

            account.resetPasswordOtp = hashedOtp;
            account.resetPasswordToken = hashedToken;
            account.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity
            await account.save();

            const recipientName = isStaff ? account.fullName : (account.ownerName || account.businessName || "User");
            const senderEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

            console.log(`\n======================================================`);
            console.log(`[AUTH OTP CODE] Email: ${inputEmail} | OTP: ${otp}`);
            console.log(`======================================================\n`);

            try {
                const { data, error } = await resend.emails.send({
                    from: senderEmail,
                    to: inputEmail,
                    subject: `${otp} is your BusinessHub verification code`,
                    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #065f46; margin: 0; font-size: 24px; font-weight: 700;">BusinessHub NG</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Verification Code</p>
              </div>

              <p style="font-size: 15px; color: #334155; margin-bottom: 16px;">Hi <strong>${recipientName}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
                We received a request to reset your password. Use the verification code below to complete your password reset:
              </p>

              <!-- OTP Display Box -->
              <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: #f0fdf4; border: 2px dashed #059669; border-radius: 10px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #065f46;">
                  ${otp}
                </span>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #047857; font-weight: 500;">
                  This code expires in 15 minutes
                </p>
              </div>

              <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                If you did not request this code, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                © ${new Date().getFullYear()} BusinessHub NG. All rights reserved.
              </p>
            </div>
          `,
                });

                if (error) {
                    console.error("[Resend API Error]:", error);
                    throw new Error(`Email delivery failed: ${error.message}`);
                }

                console.log("[Resend Email Sent Successfully]:", data);
            } catch (emailError: any) {
                console.error("[Failed to send reset OTP email]:", emailError);
                throw new Error(emailError.message || "Failed to send verification code. Please check your email configuration.");
            }

            return {
                success: true,
                message: "A 6-digit verification code has been sent to your email.",
            };
        },

        // 2. Verify OTP & Reset Password
        resetForgotPasswordWithOtp: async (
            _: any,
            { email, otp, newPassword }: { email: string; otp: string; newPassword: string }
        ) => {
            const inputEmail = (email || "").trim().toLowerCase();
            const inputOtp = (otp || "").trim();

            if (!inputEmail || !inputOtp || !newPassword) {
                throw new Error("Email, verification code, and new password are required.");
            }

            if (newPassword.length < 8) {
                throw new Error("Password must be at least 8 characters long.");
            }

            await connectDB();

            const hashedOtp = crypto.createHash("sha256").update(inputOtp).digest("hex");

            // Look up matching Business or Staff
            let account: any = await Business.findOne({
                workEmail: { $regex: new RegExp(`^${inputEmail}$`, "i") },
                $or: [{ resetPasswordOtp: hashedOtp }, { resetPasswordOtp: inputOtp }],
                resetPasswordExpires: { $gt: new Date() },
            });

            if (!account) {
                account = await Staff.findOne({
                    email: { $regex: new RegExp(`^${inputEmail}$`, "i") },
                    $or: [{ resetPasswordOtp: hashedOtp }, { resetPasswordOtp: inputOtp }],
                    resetPasswordExpires: { $gt: new Date() },
                });
            }

            if (!account) {
                throw new Error("Invalid or expired verification code. Please check the code or request a new one.");
            }

            // Hash new password
            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            account.password = await bcrypt.hash(newPassword, saltRounds);

            // Invalidate the OTP and token
            account.resetPasswordOtp = undefined;
            account.resetPasswordToken = undefined;
            account.resetPasswordExpires = undefined;

            await account.save();

            return {
                success: true,
                message: "Password reset successful! You can now log in with your new password.",
            };
        },

        // 3. Process URL Token & Set New Password (Legacy Support)
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

            const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

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

            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            account.password = await bcrypt.hash(newPassword, saltRounds);

            account.resetPasswordOtp = undefined;
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