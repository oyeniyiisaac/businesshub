import gql from "graphql-tag";

export const typeDefs = gql`
    type Product {
        id: ID!
        name: String!
        category: String!
        brand: String
        description: String
        inventoryTracking: InventoryTracking!
        pricing: PricingAndTax!
        stockLevel: StockLevel!
    }

    type InventoryTracking {
        sku: String
        unitOfMeasure: String!
        barcode: String
    }

    type PricingAndTax {
        costPrice: Float!
        sellingPrice: Float!
        taxRule: String!
    }

    type StockLevel {
        initialQuantity: Int!
        lowStockThreshold: Int!
        enableLowStockAlerts: Boolean!
    }

    extend type Query {
        products: [Product!]!
        product(id: ID!): Product
    }
`