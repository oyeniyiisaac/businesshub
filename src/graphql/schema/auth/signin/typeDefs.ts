import gql from "graphql-tag";

export const typeDefs = gql`
    # User type returned inside AuthPayload for both Business Owners & Staff
    type UserPayload {
        id: ID!
        fullName: String
        email: String
        workEmail: String!
        phoneNumber: String
        role: String!
        mustChangePassword: Boolean
    }

    type AuthPayload {
        token: String!
        user: UserPayload!
    }

    type Business {
        id: ID!
        businessName: String!
        ownerName: String!
        workEmail: String!
        phoneNumber: String!
        role: String!
        password: String!
        checkActionCode: Boolean!
    }

    type Query {
        businesses: [Business!]!
        business(id: ID!): Business
    }

    type Mutation {
        signInUser(workEmail: String!, password: String!): AuthPayload!
        login(email: String, workEmail: String, password: String!): AuthPayload!
    }
`;