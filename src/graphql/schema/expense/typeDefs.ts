import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum PaymentMethod {
    CASH
    CARD
    BANK_TRANSFER
    POS
    OTHER
  }

  type Expense {
    id: ID!
    category: String!
    amount: Float!
    dateOfExpense: String!
    paymentMethod: PaymentMethod
    referenceNumber: String
    description: String
    receiptUrl: String
    status: String
    isRecurring: Boolean
    createdAt: String
    updatedAt: String
  }

  input CreateExpenseInput {
    category: String!
    amount: Float!
    dateOfExpense: String!
    paymentMethod: PaymentMethod
    referenceNumber: String
    description: String!
    receiptUrl: String
    status: String
    isRecurring: Boolean
  }

  input UpdateExpenseInput {
    category: String
    amount: Float
    dateOfExpense: String
    paymentMethod: PaymentMethod
    referenceNumber: String
    description: String
    receiptUrl: String
    status: String
    isRecurring: Boolean
  }

  extend type Query {
    expenses: [Expense!]!
    expense(id: ID!): Expense
  }

  extend type Mutation {
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!
  }
`;