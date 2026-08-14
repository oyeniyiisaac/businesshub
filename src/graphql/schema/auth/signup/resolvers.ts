import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import { resend } from "@/src/lib/resend";
import bcrypt from "bcryptjs";

type signup = {
    id?: string;
    businessName: string;
    ownerName: string;
    workEmail: string;
    phoneNumber: string;
    password: string;
    checkActionCode?: boolean;
};

export const resolvers = {
    Query: {
        businesses: async () => {
            await connectDB();
            return Business.find();
        },
        business: async (_: any, { id }: { id: string }) => {
            await connectDB();
            return Business.findById(id);
        },
    },
    Mutation: {
        signUpUser: async (_: any, { businessName, ownerName, workEmail, phoneNumber, password, checkActionCode }: signup) => {
            await connectDB();
            if (!businessName || !ownerName || !workEmail || !phoneNumber || !password) {
                throw new Error("All fields are required.");
            }
            const existingBusiness = await Business.findOne({ workEmail });
            if (existingBusiness) {
                throw new Error("Business with this email already exists.");
            }
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newBusiness = new Business({
                businessName,
                ownerName,
                workEmail,
                phoneNumber,
                password: hashedPassword,
                checkActionCode: checkActionCode || false
            });

            await newBusiness.save();
            try {
                await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: workEmail,
                    subject: `Welcome to Our Platform, ${businessName}!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h1 style="color: #0070f3;">Welcome aboard, ${ownerName}! 👋</h1>
                        <p>Thank you for registering <strong>${businessName}</strong> on our platform.</p>
                        <p>Your account has been successfully created with <code>${workEmail}</code>.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 14px; color: #666;">If you have any questions or need help getting started, feel free to reply to this email.</p>
                        </div>
                    `,
                });
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError);
            }
            return {
                id: newBusiness._id.toString(),
                businessName: newBusiness.businessName,
                ownerName: newBusiness.ownerName,
                workEmail: newBusiness.workEmail,
                phoneNumber: newBusiness.phoneNumber,
                password: newBusiness.password,
                checkActionCode: newBusiness.checkActionCode
            };
        },
    }
}