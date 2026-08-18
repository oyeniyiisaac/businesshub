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

import { resolvers as blogResolvers } from "@/src/graphql/schema/blog/resolvers";
import { resolvers as signInResolvers } from "@/src/graphql/schema/auth/signin/resolvers";
import { resolvers as signUpResolvers } from "@/src/graphql/schema/auth/signup/resolvers";
import { resolvers as resetPasswordResolvers } from "@/src/graphql/schema/auth/resetpassword/resolvers";
import { resolvers as forgetPasswordResolvers } from "@/src/graphql/schema/auth/forgetpassword/resolvers";
// import { resolvers as dashboardResolvers } from "@/src/graphql/schema/dashboard/resolvers";
import { resolvers as productResolvers } from "@/src/graphql/schema/product/resolvers";
import { resolvers as customerResolvers } from "@/src/graphql/schema/customer/resolvers";
import { resolvers as vendorResolvers } from "@/src/graphql/schema/vendor/resolvers";
import { resolvers as expenseResolvers } from "@/src/graphql/schema/expense/resolvers";

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { connectDB } from "@/src/lib/connect";

const apolloServer = new ApolloServer({
    typeDefs: [blogTypeDefs, signInTypeDefs, signUpTypeDefs, resetPasswordTypeDefs, forgetPasswordTypeDefs, dashboardTypeDefs, productTypeDefs, customerTypeDefs, vendorTypeDefs, expenseTypeDefs],
    resolvers: {
        Query: {
            ...(blogResolvers.Query || {}),
            ...(signInResolvers.Query || {}),
            ...(signUpResolvers.Query || {}),
            ...(resetPasswordResolvers.Query || {}),
            ...(productResolvers.Query || {}),
            ...(customerResolvers.Query || {}),
            ...(vendorResolvers.Query || {}),
            ...(expenseResolvers.Query || {}),
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
        },
    },
});

// Pass global Web standard <Request> as generic to force App Router typing
const handler = startServerAndCreateNextHandler<Request>(apolloServer, {
    context: async (req) => {
        await connectDB();
        return { req };
    },
});

export async function GET(request: Request) {
    return handler(request);
}

export async function POST(request: Request) {
    return handler(request);
}