import gql from "graphql-tag";

export const typeDefs = gql`
    extend type Mutation {
        signUpUser(
            businessName: String!
            ownerName: String!
            workEmail: String!
            phoneNumber: String!
            role: String!
            password: String!
            checkActionCode: Boolean
        ): Business!
    }
`;