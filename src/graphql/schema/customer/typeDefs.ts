import gql from "graphql-tag"

export const typeDefs = gql`
    type Customer {
        id: ID!
        name: String!
        email: String!
        phone: String!
        address: String!
        accountBalance: AccountBalance!
        loyaltyProgram: Boolean
    }

    type AccountBalance {
        credit: Float
        debt: Float
    }

    extend type Query {
        customers: [Customer!]!
        customer(id: ID!): Customer
    }

    input accountBalance {
        credit: Float
        debt: Float
    }

    extend type Mutation {
        addCustomer(
            name: String!
            email: String!
            phone: String!
            address: String!
            accountBalance: accountBalance
            loyaltyProgram: Boolean
        ): Customer!

        updateCustomer(
            id: ID!
            name: String
            email: String
            phone: String
            address: String
            accountBalance: accountBalance
            loyaltyProgram: Boolean
        ): Customer!

        deleteCustomer(id: ID!): Boolean!
    }
`