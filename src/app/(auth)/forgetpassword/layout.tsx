import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "A platform for managing your business",
};

export default function ForgotLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
