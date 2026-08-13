import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "A platform for managing your business",
};

export default function RegisterLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
