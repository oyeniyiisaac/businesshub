import gql from "graphql-tag";


export const typeDefs = gql`
    type Business {
        id: ID!
        businessName: String!
        ownerName: String!
        workEmail: String!
        phoneNumber: String!
        password: String!
        checkActionCode: Boolean!
    }

    extend type Query{
        businesses: [Business!]!
        business(id: ID!): Business
    }

    extend type Mutation {
        resetPassword(workEmail: String!, currentPassword: String!, newPassword: String!): Business!
    }
`;