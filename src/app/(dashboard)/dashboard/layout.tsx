import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "A platform for managing your business",
};

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
