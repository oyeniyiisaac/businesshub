import gql from "graphql-tag";

export const typeDefs = gql`
  # Matrix Actions
  type PermissionAction {
    view: Boolean!
    create: Boolean!
    edit: Boolean!
    delete: Boolean!
    approve: Boolean!
  }

  input PermissionActionInput {
    view: Boolean!
    create: Boolean!
    edit: Boolean!
    delete: Boolean!
    approve: Boolean!
  }

  # Module Permissions Mapping
  type PermissionModule {
    module: String!
    permissions: PermissionAction!
  }

  input PermissionModuleInput {
    module: String!
    permissions: PermissionActionInput!
  }

  # Role Data Type
  type Role {
    id: ID!
    businessId: ID!
    name: String!
    description: String
    isSystemRole: Boolean!
    userCount: Int
    modules: [PermissionModule!]!
    createdAt: String
    updatedAt: String
  }

  # Role Inputs for Mutations
  input CreateRoleInput {
    name: String!
    description: String
    modules: [PermissionModuleInput!]!
  }

  input UpdateRoleInput {
    name: String
    description: String
    modules: [PermissionModuleInput!]
  }

  extend type Query {
    # Fetch all roles for the authenticated business
    roles: [Role!]!
    # Fetch a single role details & permissions matrix
    role(id: ID!): Role
    # Fetch the authenticated user's active permissions matrix
    myPermissions: [PermissionModule!]!
  }

  extend type Mutation {
    # Create a new role with assigned permissions
    createRole(input: CreateRoleInput!): Role!
    # Update permissions or name for a role
    updateRole(id: ID!, input: UpdateRoleInput!): Role!
    # Delete a custom role
    deleteRole(id: ID!): Boolean!
  }
`;