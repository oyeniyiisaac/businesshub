import { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS",
  description: "A platform for managing your business",
};

export default function POSLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
