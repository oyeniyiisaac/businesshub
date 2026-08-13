import gql from "graphql-tag";


export const typeDefs = gql`
    type AuthPayload {
        token: String!
        user: Business!
    }

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
        signUpUser(businessName: String!, ownerName: String!, workEmail: String!, phoneNumber: String!, password: String!, checkActionCode: Boolean): Business!
        signInUser(workEmail: String!, password: String!): AuthPayload!
    }
`;