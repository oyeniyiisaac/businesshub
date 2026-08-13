import { typeDefs as blogTypeDefs } from "@/src/graphql/schema/blog/typeDefs";
import { typeDefs as authTypeDefs } from "@/src/graphql/schema/auth/typeDefs";
import { resolvers as blogResolvers } from "@/src/graphql/schema/blog/resolvers";
import { resolvers as authResolvers } from "@/src/graphql/schema/auth/resolvers";
import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const apolloServer =  new ApolloServer({
    typeDefs: [blogTypeDefs, authTypeDefs],
    resolvers: {
        Query: {
            ...(blogResolvers.Query || {}),
            ...(authResolvers.Query || {}),
        },
        Mutation: {
            ...(blogResolvers.Mutation || {}),
            ...(authResolvers.Mutation || {}),
        },
    }

})

const handler =  startServerAndCreateNextHandler(apolloServer)

export { handler as GET, handler as POST }