import { Metadata } from "next";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
    title: "Business Hub",
    description: "A platform for managing your business",
};

export default function LandingPageLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <Navbar/>
            {children}
        </>
    );
}