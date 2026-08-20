import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum PaymentTerms {
    DUE_ON_RECEIPT
    NET_15
    NET_30
    NET_60
  }

  type Vendor {
    id: ID!
    businessName: String!
    category: String
    tin: String
    primaryContactPerson: String
    phoneNumber: String
    emailAddress: String
    physicalAddress: String
    defaultPaymentTerms: PaymentTerms
    initialBalanceOwed: Float
    outstandingBalance: Float
    activeOrders: Int
    pendingDeliveries: Int
    status: String
    enforceCreditLimit: Boolean
    creditLimitAmount: Float
    createdAt: String
    updatedAt: String
  }

  input CreateVendorInput {
    businessName: String!
    category: String
    tin: String
    primaryContactPerson: String
    phoneNumber: String
    emailAddress: String
    physicalAddress: String
    defaultPaymentTerms: PaymentTerms
    initialBalanceOwed: Float
    outstandingBalance: Float
    activeOrders: Int
    pendingDeliveries: Int
    status: String
    enforceCreditLimit: Boolean
    creditLimitAmount: Float
  }

  input UpdateVendorInput {
    businessName: String
    category: String
    tin: String
    primaryContactPerson: String
    phoneNumber: String
    emailAddress: String
    physicalAddress: String
    defaultPaymentTerms: PaymentTerms
    initialBalanceOwed: Float
    outstandingBalance: Float
    activeOrders: Int
    pendingDeliveries: Int
    status: String
    enforceCreditLimit: Boolean
    creditLimitAmount: Float
  }

  extend type Query {
    vendors: [Vendor!]!
    vendor(id: ID!): Vendor
    suppliers: [Vendor!]!
    supplier(id: ID!): Vendor
  }

  extend type Mutation {
    createVendor(input: CreateVendorInput!): Vendor!
    updateVendor(id: ID!, input: UpdateVendorInput!): Vendor!
    deleteVendor(id: ID!): Boolean!
    createSupplier(input: CreateVendorInput!): Vendor!
    updateSupplier(id: ID!, input: UpdateVendorInput!): Vendor!
    deleteSupplier(id: ID!): Boolean!
  }
`;