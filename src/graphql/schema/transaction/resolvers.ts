import mongoose from "mongoose";
import Transaction from "@/src/app/model/transaction";
import { Product } from "@/src/app/model/product.model";
import Customer from "@/src/app/model/customer";
import { connectDB } from "@/src/lib/connect";
import { toBusinessQuery, requireBusinessId } from "@/src/lib/tenant";

export const resolvers = {
  Query: {
    transactions: async (_: any, args: any, context: any) => {
      await connectDB();
      const { search, status, paymentMethod, limit = 50, page = 1 } = args;

      const businessId = context?.user?.businessId;
      if (!businessId) return [];

      const query: any = {
        businessId: toBusinessQuery(businessId),
      };

      if (status && status !== "ALL") {
        query.paymentStatus = status.toUpperCase();
      }

      if (paymentMethod && paymentMethod !== "ALL") {
        query.paymentMethod = paymentMethod.toUpperCase();
      }

      if (search) {
        query.$or = [
          { receiptNumber: { $regex: search, $options: "i" } },
          { "customer.name": { $regex: search, $options: "i" } },
          { transactionRef: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const records = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return records.map((r: any) => ({
        id: r._id.toString(),
        receiptNumber: r.receiptNumber,
        branchId: r.branchId,
        customer: r.customer,
        cashier: r.cashier,
        items: r.items,
        subtotal: r.subtotal,
        discountPercent: r.discountPercent,
        discountAmount: r.discountAmount,
        vatAmount: r.vatAmount,
        grandTotal: r.grandTotal,
        paymentMethod: r.paymentMethod,
        paymentStatus: r.paymentStatus,
        transactionRef: r.transactionRef,
        notes: r.notes,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
      }));
    },

    transaction: async (_: any, { id }: { id: string }, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) return null;

      const r = await Transaction.findOne({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });
      if (!r) return null;

      return {
        id: r._id.toString(),
        receiptNumber: r.receiptNumber,
        branchId: r.branchId,
        customer: r.customer,
        cashier: r.cashier,
        items: r.items,
        subtotal: r.subtotal,
        discountPercent: r.discountPercent,
        discountAmount: r.discountAmount,
        vatAmount: r.vatAmount,
        grandTotal: r.grandTotal,
        paymentMethod: r.paymentMethod,
        paymentStatus: r.paymentStatus,
        transactionRef: r.transactionRef,
        notes: r.notes,
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
      };
    },

    transactionMetrics: async (_: any, __: any, context: any) => {
      await connectDB();
      const businessId = context?.user?.businessId;
      if (!businessId) {
        return {
          totalRevenue: 0,
          avgOrderValue: 0,
          totalTransactions: 0,
          pendingPayments: 0,
        };
      }

      const all = await Transaction.find({ businessId: toBusinessQuery(businessId) });
      const totalTransactions = all.length;

      let totalRevenue = 0;
      let pendingPayments = 0;

      for (const t of all) {
        if (t.paymentStatus === "SUCCESSFUL") {
          totalRevenue += t.grandTotal || 0;
        } else if (t.paymentStatus === "PENDING") {
          pendingPayments += t.grandTotal || 0;
        }
      }

      const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        totalRevenue,
        avgOrderValue,
        totalTransactions,
        pendingPayments,
      };
    },
  },

  Mutation: {
    createTransaction: async (_: any, { input }: any, context: any) => {
      await connectDB();
      const businessId = requireBusinessId(context);

      const receiptNumber =
        input.receiptNumber ||
        `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const customerPayload = {
        customerId: input.customer?.customerId,
        name: input.customer?.name || "Walk-in Customer",
        phone: input.customer?.phone || "N/A",
        email: input.customer?.email || "",
        loyaltyPointsEarned:
          input.customer?.loyaltyPointsEarned || Math.floor(input.grandTotal / 200),
      };

      const cashierPayload = {
        cashierId: context?.user?.userId || "cashier-admin",
        name: context?.user?.email?.split("@")[0] || "Super Admin",
      };

      const newTx = new Transaction({
        receiptNumber,
        businessId: new mongoose.Types.ObjectId(businessId),
        branchId: input.branchId || "Main Branch",
        customer: customerPayload,
        cashier: cashierPayload,
        items: input.items,
        subtotal: input.subtotal,
        discountPercent: input.discountPercent || 0,
        discountAmount: input.discountAmount || 0,
        vatAmount: input.vatAmount || 0,
        grandTotal: input.grandTotal,
        paymentMethod: input.paymentMethod || "CARD",
        paymentStatus: input.paymentStatus || "SUCCESSFUL",
        transactionRef: input.transactionRef || "",
        notes: input.notes || "",
      });

      const saved = await newTx.save();

      // Automatically decrement stock quantities for purchased items scoped to this business
      if (Array.isArray(input.items)) {
        for (const item of input.items) {
          if (item.productId && !item.productId.startsWith("prod-")) {
            try {
              await Product.findOneAndUpdate(
                { _id: item.productId, businessId: toBusinessQuery(businessId) },
                {
                  $inc: { "stockLevel.initialQuantity": -item.quantity },
                }
              );
            } catch {
              // ignore invalid ObjectId
            }
          }
        }
      }

      // If customer is registered in DB, update their totalPurchases and loyaltyPoints scoped to this business
      if (input.customer?.customerId && !input.customer.customerId.startsWith("cust-")) {
        try {
          await Customer.findOneAndUpdate(
            { _id: input.customer.customerId, businessId: toBusinessQuery(businessId) },
            {
              $inc: {
                totalPurchases: input.grandTotal,
                loyaltyPoints: customerPayload.loyaltyPointsEarned,
              },
            }
          );
        } catch {
          // ignore
        }
      }

      return {
        id: saved._id.toString(),
        receiptNumber: saved.receiptNumber,
        branchId: saved.branchId,
        customer: saved.customer,
        cashier: saved.cashier,
        items: saved.items,
        subtotal: saved.subtotal,
        discountPercent: saved.discountPercent,
        discountAmount: saved.discountAmount,
        vatAmount: saved.vatAmount,
        grandTotal: saved.grandTotal,
        paymentMethod: saved.paymentMethod,
        paymentStatus: saved.paymentStatus,
        transactionRef: saved.transactionRef,
        notes: saved.notes,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt?.toISOString(),
      };
    },

    updateTransactionStatus: async (
      _: any,
      { id, status, transactionRef }: { id: string; status: string; transactionRef?: string },
      context: any
    ) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const updateData: any = { paymentStatus: status.toUpperCase() };
      if (transactionRef) {
        updateData.transactionRef = transactionRef;
      }

      const updated = await Transaction.findOneAndUpdate(
        { _id: id, businessId: toBusinessQuery(businessId) },
        updateData,
        { new: true }
      );
      if (!updated) throw new Error("Transaction not found or unauthorized");

      return {
        id: updated._id.toString(),
        receiptNumber: updated.receiptNumber,
        branchId: updated.branchId,
        customer: updated.customer,
        cashier: updated.cashier,
        items: updated.items,
        subtotal: updated.subtotal,
        discountPercent: updated.discountPercent,
        discountAmount: updated.discountAmount,
        vatAmount: updated.vatAmount,
        grandTotal: updated.grandTotal,
        paymentMethod: updated.paymentMethod,
        paymentStatus: updated.paymentStatus,
        transactionRef: updated.transactionRef,
        notes: updated.notes,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      };
    },

    deleteTransaction: async (_: any, { id }: { id: string }, context: any) => {
      await connectDB();
      const businessId = requireBusinessId(context);
      const res = await Transaction.findOneAndDelete({
        _id: id,
        businessId: toBusinessQuery(businessId),
      });
      return !!res;
    },
  },
};
