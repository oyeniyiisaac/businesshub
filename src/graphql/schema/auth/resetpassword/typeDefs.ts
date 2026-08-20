import gql from "graphql-tag";

export const typeDefs = gql`
    extend type Mutation {
        resetPassword(workEmail: String!, currentPassword: String!, newPassword: String!): Business!
    }
`;