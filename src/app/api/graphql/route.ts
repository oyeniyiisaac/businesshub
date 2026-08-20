import { typeDefs as blogTypeDefs } from "@/src/graphql/schema/blog/typeDefs";
import { typeDefs as signInTypeDefs } from "@/src/graphql/schema/auth/signin/typeDefs";
import { typeDefs as signUpTypeDefs } from "@/src/graphql/schema/auth/signup/typeDefs";
import { typeDefs as resetPasswordTypeDefs } from "@/src/graphql/schema/auth/resetpassword/typeDefs";
import { typeDefs as forgetPasswordTypeDefs } from "@/src/graphql/schema/auth/forgetpassword/typeDefs";
import { typeDefs as dashboardTypeDefs } from "@/src/graphql/schema/dashboard/typeDefs";
import { typeDefs as productTypeDefs } from "@/src/graphql/schema/product/typeDefs";
import { typeDefs as customerTypeDefs } from "@/src/graphql/schema/customer/typeDefs";
import { typeDefs as vendorTypeDefs } from "@/src/graphql/schema/vendor/typeDefs"
import { typeDefs as expenseTypeDefs } from "@/src/graphql/schema/expense/typeDefs"
import { typeDefs as branchTypeDefs } from "@/src/graphql/schema/branch/typeDefs";
import { typeDefs as staffRoleTypeDefs } from "@/src/graphql/schema/staffRole/typeDefs";
import { typeDefs as roleTypeDefs } from "@/src/graphql/schema/role/typeDefs";
import { typeDefs as businessTypeDefs } from "@/src/graphql/schema/business/typeDefs";
import { typeDefs as transactionTypeDefs } from "@/src/graphql/schema/transaction/typeDefs";

import { resolvers as blogResolvers } from "@/src/graphql/schema/blog/resolvers";
import { resolvers as signInResolvers } from "@/src/graphql/schema/auth/signin/resolvers";
import { resolvers as signUpResolvers } from "@/src/graphql/schema/auth/signup/resolvers";
import { resolvers as resetPasswordResolvers } from "@/src/graphql/schema/auth/resetpassword/resolvers";
import { resolvers as forgetPasswordResolvers } from "@/src/graphql/schema/auth/forgetpassword/resolvers";
import { resolvers as dashboardResolvers } from "@/src/graphql/schema/dashboard/resolvers";
import { resolvers as productResolvers } from "@/src/graphql/schema/product/resolvers";
import { resolvers as customerResolvers } from "@/src/graphql/schema/customer/resolvers";
import { resolvers as vendorResolvers } from "@/src/graphql/schema/vendor/resolvers";
import { resolvers as expenseResolvers } from "@/src/graphql/schema/expense/resolvers";
import { resolvers as branchResolvers } from "@/src/graphql/schema/branch/resolvers";
import { resolvers as staffRoleResolvers } from "@/src/graphql/schema/staffRole/resolvers";
import { resolvers as roleResolvers } from "@/src/graphql/schema/role/resolvers";
import { resolvers as businessResolvers } from "@/src/graphql/schema/business/resolvers";
import { resolvers as transactionResolvers } from "@/src/graphql/schema/transaction/resolvers";

import jwt from "jsonwebtoken";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { connectDB } from "@/src/lib/connect";

const apolloServer = new ApolloServer({
    typeDefs: [
        blogTypeDefs,
        signInTypeDefs,
        signUpTypeDefs,
        resetPasswordTypeDefs,
        forgetPasswordTypeDefs,
        dashboardTypeDefs,
        productTypeDefs,
        customerTypeDefs,
        vendorTypeDefs,
        expenseTypeDefs,
        branchTypeDefs,
        staffRoleTypeDefs,
        roleTypeDefs,
        businessTypeDefs,
        transactionTypeDefs,
    ],
    resolvers: {
        Query: {
            ...(blogResolvers.Query || {}),
            ...(signInResolvers.Query || {}),
            ...(signUpResolvers.Query || {}),
            ...(resetPasswordResolvers.Query || {}),
            ...(dashboardResolvers.Query || {}),
            ...(productResolvers.Query || {}),
            ...(customerResolvers.Query || {}),
            ...(vendorResolvers.Query || {}),
            ...(expenseResolvers.Query || {}),
            ...(branchResolvers.Query || {}),
            ...(staffRoleResolvers.Query || {}),
            ...(roleResolvers.Query || {}),
            ...(businessResolvers.Query || {}),
            ...(transactionResolvers.Query || {}),
        },
        Mutation: {
            ...(blogResolvers.Mutation || {}),
            ...(signInResolvers.Mutation || {}),
            ...(signUpResolvers.Mutation || {}),
            ...(resetPasswordResolvers.Mutation || {}),
            ...(forgetPasswordResolvers.Mutation || {}),
            ...(productResolvers.Mutation || {}),
            ...(customerResolvers.Mutation || {}),
            ...(vendorResolvers.Mutation || {}),
            ...(expenseResolvers.Mutation || {}),
            ...(branchResolvers.Mutation || {}),
            ...(staffRoleResolvers.Mutation || {}),
            ...(roleResolvers.Mutation || {}),
            ...(businessResolvers.Mutation || {}),
            ...(transactionResolvers.Mutation || {}),
        },
    },
});

// Pass global Web standard <Request> as generic to force App Router typing
const handler = startServerAndCreateNextHandler<Request>(apolloServer, {
    context: async (req) => {
        await connectDB();

        let user = undefined;
        try {
            const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
            if (authHeader.startsWith("Bearer ")) {
                const token = authHeader.substring(7);
                const secret = process.env.JWT_SECRET;
                if (secret) {
                    const decoded = jwt.verify(token, secret) as any;
                    if (decoded && (decoded.businessId || decoded.userId)) {
                        user = {
                            userId: decoded.userId,
                            businessId: decoded.businessId || decoded.userId,
                            role: decoded.role,
                            email: decoded.email,
                            isStaff: decoded.isStaff,
                        };
                    }
                }
            }
        } catch {
            // Invalid or expired token, context.user remains undefined
        }

        return { req, user };
    },
});

export async function GET(request: Request) {
    return handler(request);
}

export async function POST(request: Request) {
    return handler(request);
}