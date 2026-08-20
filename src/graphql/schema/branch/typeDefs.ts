import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum TaxRule {
    STANDARD_VAT
    ZERO_RATED
    TAX_EXEMPT
  }

  type BusinessHours {
    openingTime: String!
    closingTime: String!
  }

  input BusinessHoursInput {
    openingTime: String!
    closingTime: String!
  }

  type Branch {
    id: ID!
    branchName: String!
    branchCode: String!
    assignedManager: String
    fullAddress: String
    city: String
    state: String
    phoneNumber: String
    branchEmail: String
    defaultTaxRule: TaxRule
    businessHours: BusinessHours
    totalStaff: Int
    todaySales: Float
    isActive: Boolean!
    createdAt: String
    updatedAt: String
  }

  input CreateBranchInput {
    branchName: String!
    branchCode: String!
    assignedManager: String
    fullAddress: String
    city: String
    state: String
    phoneNumber: String
    branchEmail: String
    defaultTaxRule: TaxRule
    businessHours: BusinessHoursInput
    totalStaff: Int
    todaySales: Float
    isActive: Boolean
  }

  input UpdateBranchInput {
    branchName: String
    branchCode: String
    assignedManager: String
    fullAddress: String
    city: String
    state: String
    phoneNumber: String
    branchEmail: String
    defaultTaxRule: TaxRule
    businessHours: BusinessHoursInput
    totalStaff: Int
    todaySales: Float
    isActive: Boolean
  }

  type Query {
    branches: [Branch!]!
    branch(id: ID!): Branch
  }

  type Mutation {
    createBranch(input: CreateBranchInput!): Branch!
    updateBranch(id: ID!, input: UpdateBranchInput!): Branch!
    deleteBranch(id: ID!): Boolean!
  }
`;