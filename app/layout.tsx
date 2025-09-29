import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppUtilsProvider } from "@/context/AppUtils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CRUD application with Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply Bootstrap flexbox layout */}
      <body className="d-flex flex-column min-vh-100">
        <AppUtilsProvider>
          <Toaster />
          <Navbar />
          {/* Main grows to take up available space */}
          <main className="flex-grow-1">{children}</main>
          <Footer />
        </AppUtilsProvider>
      </body>
    </html>
  );
}
