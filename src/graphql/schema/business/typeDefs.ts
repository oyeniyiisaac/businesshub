import { gql } from "graphql-tag";

export const typeDefs = gql`
  type TaxRate {
    id: ID
    name: String!
    description: String
    rate: Float!
    type: String!
    status: String!
  }

  input TaxRateInput {
    id: ID
    name: String!
    description: String
    rate: Float!
    type: String!
    status: String!
  }

  type BusinessProfile {
    id: ID!
    businessName: String!
    ownerName: String
    workEmail: String!
    phoneNumber: String
    logoUrl: String
    registeredAddress: String
    currency: String
    taxNumber: String
    timezone: String
    dateFormat: String
    decimalPlaces: Int
    showCurrencySymbol: Boolean
    taxRates: [TaxRate]
    createdAt: String
    updatedAt: String
  }

  input UpdateBusinessProfileInput {
    businessName: String
    ownerName: String
    workEmail: String
    phoneNumber: String
    logoUrl: String
    registeredAddress: String
    currency: String
    taxNumber: String
    timezone: String
    dateFormat: String
    decimalPlaces: Int
    showCurrencySymbol: Boolean
    taxRates: [TaxRateInput]
  }

  extend type Query {
    businessProfile: BusinessProfile
  }

  extend type Mutation {
    updateBusinessProfile(input: UpdateBusinessProfileInput!): BusinessProfile!
  }
`;
