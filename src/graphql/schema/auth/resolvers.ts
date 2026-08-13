import Business from "@/src/app/model/signup.model";
import bcrypt from "bcryptjs";
import { connectDB } from "@/src/lib/connect";
import jwt from "jsonwebtoken";

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

        signInUser: async (_: any, { workEmail, password }: { workEmail: string; password: string }) => {
            await connectDB();
            const business = await Business.findOne({ workEmail });
            if (!business) {
                throw new Error("Business with this email does not exist.");
            }
            const isPasswordValid = await bcrypt.compare(password, business.password);
            if (!isPasswordValid) {
                throw new Error("Invalid password.");
            }

            const token = jwt.sign(
                { businessId: business._id, workEmail: business.workEmail },
                process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" }
            );

            return {
                token,
                user: {
                    id: business._id.toString(),
                    businessName: business.businessName,
                    ownerName: business.ownerName,
                    workEmail: business.workEmail,
                    phoneNumber: business.phoneNumber,
                    password: business.password,
                    checkActionCode: business.checkActionCode
                }
            };
        }

    }
}