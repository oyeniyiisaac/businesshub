import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum StaffRole {
    SUPER_ADMIN
    ADMIN
    BRANCH_MANAGER
    CASHIER
    ACCOUNTANT
    INVENTORY_OFFICER
  }

  type Staff {
    id: ID!
    businessId: ID
    fullName: String!
    email: String!
    phoneNumber: String
    role: String!
    branch: String!
    isActive: Boolean!
    mustChangePassword: Boolean!
    createdAt: String
    updatedAt: String
  }

  input CreateStaffInput {
    fullName: String!
    email: String!
    phoneNumber: String
    temporaryPassword: String!
    role: String!
    branchId: String!
    mustChangePassword: Boolean
  }

  input UpdateStaffInput {
    fullName: String
    email: String
    phoneNumber: String
    role: String
    branchId: String
    isActive: Boolean
    mustChangePassword: Boolean
  }

  extend type Query {
    staffMembers: [Staff!]!
    staffMember(id: ID!): Staff
  }

  extend type Mutation {
    createStaff(input: CreateStaffInput!): Staff!
    updateStaff(id: ID!, input: UpdateStaffInput!): Staff!
    deleteStaff(id: ID!): Boolean!
  }
`;  