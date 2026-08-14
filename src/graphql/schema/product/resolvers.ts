import { connectDB } from "@/src/lib/connect";

interface productInput {
  name: string;
  category: string;
  brand?: string;
  description?: string;
  inventoryTracking: {
    enabled: boolean;
    method: string;
  };
  pricing: {
    price: number;
    taxRate?: number;
  };
  stockLevel: {
    quantity: number;
    lowStockThreshold?: number;
  };
}   

export const resolvers = {
  Query: {
    getProductById: async (_: any, { id }: { id: string }, { dataSources }: any) => {
        await connectDB();
      return await dataSources.productAPI.getProductById(id);
    },
    getAllProducts: async (_: any, __: any, { dataSources }: any) => {
        await connectDB();
      return await dataSources.productAPI.getAllProducts();
    },
  },
  Mutation: {
    createProduct: async (_: any, { input }: { input: productInput }, { dataSources }: any) => {
        await connectDB();
    //   return await dataSources.productAPI.createProduct(input);
      if(!input.name || !input.category || !input.pricing.price || !input.stockLevel.quantity) {
        throw new Error("Missing required fields: name, category, price, or quantity.");
      }
      if(input.pricing.price < 0 || input.stockLevel.quantity < 0) {
        throw new Error("Price and quantity must be positive numbers.");
      }
      const existingProduct = await dataSources.productAPI.getProductByName(input.name);
      if(existingProduct) {
        throw new Error("A product with this name already exists.");
      }
      const newProduct = await dataSources.productAPI.createProduct(input);
      await newProduct.save();
      return newProduct;
    },
    updateProduct: async (_: any, { id, input }: { id: string; input: productInput }, { dataSources }: any) => {
        await connectDB();
        if(!input.name || !input.category || !input.pricing.price || !input.stockLevel.quantity) {
            throw new Error("Missing required fields: name, category, price, or quantity.");
        }
        if(input.pricing.price < 0 || input.stockLevel.quantity < 0) {
            throw new Error("Price and quantity must be positive numbers.");
        }
        const existingProduct = await dataSources.productAPI.getProductByName(input.name);
        if(existingProduct && existingProduct.id !== id) {
            throw new Error("A product with this name already exists.");
        }
        const updatedProduct = await dataSources.productAPI.updateProduct(id, input);
        if (!updatedProduct) {
            throw new Error("Product not found or update failed.");
        }
        return updatedProduct;
    },
    deleteProduct: async (_: any, { id }: { id: string }, { dataSources }: any) => {
        await connectDB();
        const deletedProduct = await dataSources.productAPI.deleteProduct(id);
        if (!deletedProduct) {
            throw new Error("Product not found or deletion failed.");
        }
        return deletedProduct;
    },
  },
};
