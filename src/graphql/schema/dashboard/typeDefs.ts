import gql from "graphql-tag";


export const typeDefs = gql`
    type Product {
        id: ID!
        productName: String!
        category: String!
        supplier: String!
        quantity: Int!
        price: Float!
    }

    extend type Query{
        products: [Product!]!
        product(id: ID!): Product
    }

`