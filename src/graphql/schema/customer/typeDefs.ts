import gql from "graphql-tag";

export const typeDefs = gql`
    type Customer {
        id: ID!
        name: String!
        email: String!
        phone: String!
        address: String!
        status: String
        totalPurchases: Float
        loyaltyPoints: Int
        creditBalance: Float
        accountBalance: AccountBalance
        loyaltyProgram: Boolean
        createdAt: String
        updatedAt: String
    }

    type AccountBalance {
        credit: Float
        debt: Float
    }

    input AccountBalanceInput {
        credit: Float
        debt: Float
    }

    extend type Query {
        customers: [Customer!]!
        customer(id: ID!): Customer
    }

    extend type Mutation {
        addCustomer(
            name: String!
            email: String!
            phone: String!
            address: String!
            status: String
            totalPurchases: Float
            loyaltyPoints: Int
            creditBalance: Float
            accountBalance: AccountBalanceInput
            loyaltyProgram: Boolean
        ): Customer!

        updateCustomer(
            id: ID!
            name: String
            email: String
            phone: String
            address: String
            status: String
            totalPurchases: Float
            loyaltyPoints: Int
            creditBalance: Float
            accountBalance: AccountBalanceInput
            loyaltyProgram: Boolean
        ): Customer!

        deleteCustomer(id: ID!): Boolean!
    }
`;