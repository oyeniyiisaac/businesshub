import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "A platform for managing your business",
};

export default function LoginLayout({ children }: LayoutProps<"/">) {
  return (
      <>{children}</>
  );
}
