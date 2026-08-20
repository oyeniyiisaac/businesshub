import gql from "graphql-tag";

export const typeDefs = gql`
  type DashboardSalesTrend {
    day: String!
    value: Float!
    heightPercent: String!
    active: Boolean!
  }

  type DashboardLowStockItem {
    id: ID!
    name: String!
    sku: String!
    count: Int!
  }

  type DashboardRecentTransaction {
    id: ID!
    transactionId: String!
    date: String!
    customerName: String!
    status: String!
    amount: Float!
    paymentMethod: String!
  }

  type DashboardMetrics {
    totalRevenue: Float!
    totalRevenueFormatted: String!
    revenueGrowth: String!
    totalSales: Int!
    salesGrowth: String!
    netProfit: Float!
    netProfitFormatted: String!
    profitGrowth: String!
    totalExpenses: Float!
    totalExpensesFormatted: String!
    expenseGrowth: String!
    weeklySalesTrend: [DashboardSalesTrend!]!
    lowStockItems: [DashboardLowStockItem!]!
    recentTransactions: [DashboardRecentTransaction!]!
  }

  extend type Query {
    dashboardMetrics(period: String): DashboardMetrics!
  }
`;