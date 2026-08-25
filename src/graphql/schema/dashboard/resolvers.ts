import Transaction from "@/src/app/model/transaction";
import { Expense } from "@/src/app/model/expense";
import { Product } from "@/src/app/model/product.model";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery } from "@/src/lib/tenant";

export const resolvers = {
  Query: {
    dashboardMetrics: async (_: any, { period }: { period?: string }, context: any) => {
      await connectDB();

      const businessId = context?.user?.businessId;
      if (!businessId) {
        return {
          totalRevenue: 0,
          totalRevenueFormatted: "₦0",
          revenueGrowth: "0%",
          totalSales: 0,
          salesGrowth: "0%",
          netProfit: 0,
          netProfitFormatted: "₦0",
          profitGrowth: "0%",
          totalExpenses: 0,
          totalExpensesFormatted: "₦0",
          expenseGrowth: "0%",
          weeklySalesTrend: [],
          lowStockItems: [],
          recentTransactions: [],
        };
      }

      const businessQuery = { businessId: toBusinessQuery(businessId) };

      // 1. Fetch transactions strictly for this business
      const transactions = await Transaction.find(businessQuery).sort({ createdAt: -1 });

      let totalRevenue = 0;
      const totalSales = transactions.length;

      // Group sales by day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
      const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      for (const tx of transactions) {
        if (tx.paymentStatus === "SUCCESSFUL" || tx.paymentStatus === "Paid") {
          const val = tx.grandTotal || 0;
          totalRevenue += val;
          const dayIndex = new Date(tx.createdAt).getDay();
          dayTotals[dayIndex] = (dayTotals[dayIndex] || 0) + val;
        }
      }

      // 2. Fetch expenses strictly for this business
      const expenses = await Expense.find(businessQuery);
      let totalExpenses = 0;
      for (const exp of expenses) {
        if (exp.status === "Approved" || !exp.status) {
          totalExpenses += exp.amount || 0;
        }
      }

      // 3. Compute Net Profit
      const netProfit = Math.max(0, totalRevenue - totalExpenses);

      // 4. Compute Weekly Trend based strictly on DB transactions
      const currentDayIndex = new Date().getDay();
      const maxDayVal = Math.max(...Object.values(dayTotals), 1);

      const daysOfWeek = [
        { day: "MON", idx: 1 },
        { day: "TUE", idx: 2 },
        { day: "WED", idx: 3 },
        { day: "THU", idx: 4 },
        { day: "FRI", idx: 5 },
        { day: "SAT", idx: 6 },
        { day: "SUN", idx: 0 },
      ];

      const weeklySalesTrend = daysOfWeek.map(({ day, idx }) => {
        const val = dayTotals[idx] || 0;
        const heightPercent = maxDayVal > 0 && val > 0 ? `${Math.round((val / maxDayVal) * 90) + 10}%` : "5%";
        return {
          day,
          value: val,
          heightPercent,
          active: currentDayIndex === idx,
        };
      });

      // 5. Fetch Real Low Stock Items strictly for this business
      const allProducts = await Product.find(businessQuery);
      const lowStockProducts = allProducts
        .filter((p: any) => {
          const qty = p.stockLevel?.initialQuantity ?? 0;
          const threshold = p.stockLevel?.lowStockThreshold ?? 5;
          return qty <= threshold;
        })
        .slice(0, 10);

      const lowStockItems = lowStockProducts.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        sku: p.inventoryTracking?.sku || `SKU-${p._id.toString().slice(-4)}`,
        count: p.stockLevel?.initialQuantity ?? 0,
      }));

      // 6. Recent Transactions strictly for this business
      const recentTransactions = transactions.slice(0, 50).map((t: any) => ({
        id: t._id.toString(),
        transactionId: t.receiptNumber.startsWith("#") ? t.receiptNumber : `#${t.receiptNumber}`,
        date: new Date(t.createdAt).toLocaleString("en-NG", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: t.customer?.name || "Walk-in Customer",
        status: t.paymentStatus === "SUCCESSFUL" || t.paymentStatus === "Paid" ? "Paid" : "Pending",
        amount: t.grandTotal || 0,
        paymentMethod: t.paymentMethod || "CASH",
      }));

      // Format helpers
      const formatCurrency = (num: number) => {
        if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`;
        return `₦${num.toLocaleString()}`;
      };

      return {
        totalRevenue,
        totalRevenueFormatted: formatCurrency(totalRevenue),
        revenueGrowth: totalSales > 0 ? "+100% vs last period" : "0%",
        totalSales,
        salesGrowth: totalSales > 0 ? "+100% vs last period" : "0%",
        netProfit,
        netProfitFormatted: formatCurrency(netProfit),
        profitGrowth: netProfit > 0 ? "+100% vs last period" : "0%",
        totalExpenses,
        totalExpensesFormatted: formatCurrency(totalExpenses),
        expenseGrowth: totalExpenses > 0 ? "+100% vs last period" : "0%",
        weeklySalesTrend,
        lowStockItems,
        recentTransactions,
      };
    },
  },
};
