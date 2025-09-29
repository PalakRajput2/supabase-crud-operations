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
      <body>
        <AppUtilsProvider>
          <Toaster/>
          <Navbar/>
          {children}
          <Footer/>
          </AppUtilsProvider>
      </body>
    </html>
  );
}
