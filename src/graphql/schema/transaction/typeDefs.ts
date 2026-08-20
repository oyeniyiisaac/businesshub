import { gql } from "graphql-tag";

export const typeDefs = gql`
  type TransactionItem {
    productId: String!
    name: String!
    sku: String!
    price: Float!
    quantity: Int!
    subtotal: Float!
  }

  type TransactionCustomer {
    customerId: String
    name: String!
    phone: String
    email: String
    loyaltyPointsEarned: Int
  }

  type TransactionCashier {
    cashierId: String
    name: String
  }

  type Transaction {
    id: ID!
    receiptNumber: String!
    branchId: String
    customer: TransactionCustomer!
    cashier: TransactionCashier!
    items: [TransactionItem!]!
    subtotal: Float!
    discountPercent: Float
    discountAmount: Float
    vatAmount: Float
    grandTotal: Float!
    paymentMethod: String!
    paymentStatus: String!
    transactionRef: String
    notes: String
    createdAt: String!
    updatedAt: String
  }

  type TransactionMetrics {
    totalRevenue: Float!
    avgOrderValue: Float!
    totalTransactions: Int!
    pendingPayments: Float!
  }

  input CreateTransactionItemInput {
    productId: String!
    name: String!
    sku: String!
    price: Float!
    quantity: Int!
    subtotal: Float!
  }

  input CreateTransactionCustomerInput {
    customerId: String
    name: String!
    phone: String
    email: String
    loyaltyPointsEarned: Int
  }

  input CreateTransactionInput {
    receiptNumber: String
    branchId: String
    customer: CreateTransactionCustomerInput
    items: [CreateTransactionItemInput!]!
    subtotal: Float!
    discountPercent: Float
    discountAmount: Float
    vatAmount: Float
    grandTotal: Float!
    paymentMethod: String!
    paymentStatus: String!
    transactionRef: String
    notes: String
  }

  extend type Query {
    transactions(
      limit: Int
      page: Int
      search: String
      status: String
      paymentMethod: String
    ): [Transaction!]!
    transaction(id: ID!): Transaction
    transactionMetrics: TransactionMetrics!
  }

  extend type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransactionStatus(
      id: ID!
      status: String!
      transactionRef: String
    ): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`;
