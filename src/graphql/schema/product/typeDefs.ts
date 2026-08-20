import gql from "graphql-tag";

export const typeDefs = gql`
    type Product {
        id: ID!
        name: String!
        category: String!
        brand: String
        supplier: String
        description: String
        imageUrl: String
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

    input InventoryTrackingInput {
        sku: String
        unitOfMeasure: String!
        barcode: String
    }

    input PricingAndTaxInput {
        costPrice: Float!
        sellingPrice: Float!
        taxRule: String!
    }

    input StockLevelInput {
        initialQuantity: Int!
        lowStockThreshold: Int!
        enableLowStockAlerts: Boolean!
    }

    extend type Mutation {
    addProduct(
        name: String!
        category: String!
        brand: String
        supplier: String
        description: String
        imageUrl: String
        inventoryTracking: InventoryTrackingInput!
        pricing: PricingAndTaxInput!
        stockLevel: StockLevelInput!
    ): Product!

    createProduct(
        name: String!
        category: String!
        brand: String
        supplier: String
        description: String
        imageUrl: String
        inventoryTracking: InventoryTrackingInput!
        pricing: PricingAndTaxInput!
        stockLevel: StockLevelInput!
    ): Product!

    updateProduct(id: ID!): Product!
    deleteProduct(id: ID!): Boolean!
}

`