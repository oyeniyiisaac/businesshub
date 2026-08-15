import { typeDefs as blogTypeDefs } from "@/src/graphql/schema/blog/typeDefs";
import { typeDefs as signInTypeDefs } from "@/src/graphql/schema/auth/signin/typeDefs";
import { typeDefs as signUpTypeDefs } from "@/src/graphql/schema/auth/signup/typeDefs";
import { typeDefs as resetPasswordTypeDefs } from "@/src/graphql/schema/auth/resetpassword/typeDefs";
import { typeDefs as forgetPasswordTypeDefs } from "@/src/graphql/schema/auth/forgetpassword/typeDefs";
import { typeDefs as dashboardTypeDefs } from "@/src/graphql/schema/dashboard/typeDefs";
import { typeDefs as productTypeDefs } from "@/src/graphql/schema/product/typeDefs";


import { resolvers as blogResolvers } from "@/src/graphql/schema/blog/resolvers";
import { resolvers as signInResolvers } from "@/src/graphql/schema/auth/signin/resolvers";
import { resolvers as signUpResolvers } from "@/src/graphql/schema/auth/signup/resolvers";
import { resolvers as resetPasswordResolvers } from "@/src/graphql/schema/auth/resetpassword/resolvers";
import { resolvers as forgetPasswordResolvers } from "@/src/graphql/schema/auth/forgetpassword/resolvers";
// import { resolvers as dashboardResolvers } from "@/src/graphql/schema/dashboard/resolvers";
import { resolvers as productResolvers } from "@/src/graphql/schema/product/resolvers";


import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const apolloServer = new ApolloServer({
    typeDefs: [blogTypeDefs, signInTypeDefs, signUpTypeDefs, resetPasswordTypeDefs, forgetPasswordTypeDefs, dashboardTypeDefs, productTypeDefs],
    resolvers: {
        Query: {
            ...(blogResolvers.Query || {}),
            ...(signInResolvers.Query || {}),
            ...(signUpResolvers.Query || {}),
            ...(resetPasswordResolvers.Query || {}),
            ...(productResolvers.Query || {}),
        },
        Mutation: {
            ...(blogResolvers.Mutation || {}),
            ...(signInResolvers.Mutation || {}),
            ...(signUpResolvers.Mutation || {}),
            ...(resetPasswordResolvers.Mutation || {}),
            ...(forgetPasswordResolvers.Mutation || {}),
            ...(productResolvers.Mutation || {}),
        },
    },
});

const handler = startServerAndCreateNextHandler(apolloServer);

export const GET = handler;
export const POST = handler;

