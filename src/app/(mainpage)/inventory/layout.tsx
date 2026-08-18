import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory",
  description: "A platform for managing your business",
};

export default function InventoryLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
