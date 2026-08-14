import { typeDefs as blogTypeDefs } from "@/src/graphql/schema/blog/typeDefs";
import { typeDefs as signInTypeDefs } from "@/src/graphql/schema/auth/signin/typeDefs";
import { typeDefs as signUpTypeDefs } from "@/src/graphql/schema/auth/signup/typeDefs";
import { typeDefs as resetPasswordTypeDefs } from "@/src/graphql/schema/auth/resetpassword/typeDefs";
import { typeDefs as forgetPasswordTypeDefs } from "@/src/graphql/schema/auth/forgetpassword/typeDefs";


import { resolvers as blogResolvers } from "@/src/graphql/schema/blog/resolvers";
import { resolvers as signInResolvers } from "@/src/graphql/schema/auth/signin/resolvers";
import { resolvers as signUpResolvers } from "@/src/graphql/schema/auth/signup/resolvers";
import { resolvers as resetPasswordResolvers } from "@/src/graphql/schema/auth/resetpassword/resolvers";
import { resolvers as forgetPasswordResolvers } from "@/src/graphql/schema/auth/forgetpassword/resolvers";


import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import type { NextRequest } from "next/server";

const apolloServer = new ApolloServer({
    typeDefs: [blogTypeDefs, signInTypeDefs, signUpTypeDefs, resetPasswordTypeDefs, forgetPasswordTypeDefs],
    resolvers: {
        Query: {
            ...(blogResolvers.Query || {}),
            ...(signInResolvers.Query || {}),
            ...(signUpResolvers.Query || {}),
            ...(resetPasswordResolvers.Query || {}),
            // ...(forgetPasswordResolvers.Query || {}),
        },
        Mutation: {
            ...(blogResolvers.Mutation || {}),
            ...(signInResolvers.Mutation || {}),
            ...(signUpResolvers.Mutation || {}),
            ...(resetPasswordResolvers.Mutation || {}),
            ...(forgetPasswordResolvers.Mutation || {}),
        },
    },
});

const handler = startServerAndCreateNextHandler<NextRequest>(apolloServer);

export async function GET(request: NextRequest, context?: { params: Promise<Record<string, string>> }) {
    return handler(request, context as any);
}

export async function POST(request: NextRequest, context?: { params: Promise<Record<string, string>> }) {
    return handler(request, context as any);
}