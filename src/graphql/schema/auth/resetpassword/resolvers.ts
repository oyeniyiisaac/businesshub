import Business from "@/src/app/model/signup.model";
import { connectDB } from "@/src/lib/connect";
import bcrypt from "bcryptjs";

type resetPassword = {
    workEmail: string;
    currentPassword: string;
    newPassword: string;
    // password: string;
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
        resetPassword: async (
            _: any,
            { workEmail, currentPassword, newPassword }: resetPassword
        ) => {
            if (!workEmail || !currentPassword || !newPassword) {
                throw new Error("All fields are required.");
            }
            // if (!currentPassword === business.password) {
            //     throw new Error("Current password does not match the provided password.");
            // }

            if (newPassword.length < 8) {
                throw new Error("New password must be at least 8 characters long.");
            }

            await connectDB();

            const business = await Business.findOne({ workEmail }).select("+password");
            if (!business) {
                throw new Error("Business with this email does not exist.");
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, business.password);
            if (!isPasswordValid) {
                throw new Error("Current password does not match the provided password.");
            }

            const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            business.password = hashedPassword;
            await business.save();

            return {
                id: business._id.toString(),
                businessName: business.businessName,
                ownerName: business.ownerName,
                workEmail: business.workEmail,
                phoneNumber: business.phoneNumber,
                password: hashedPassword,
                checkActionCode: business.checkActionCode,
            };
        },
    },
}