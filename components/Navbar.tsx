"use client";
import { useMyAppHook } from "@/context/AppUtils";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import React from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Navbar = () => {
   const router = useRouter();
  const { isLoggedIn ,setIsLoggedIn , setAuthToken } = useMyAppHook();
 

  const handleLogout = async ()=>{
    localStorage.removeItem("access_token");
    setIsLoggedIn(false)
    setAuthToken(null);
    await supabase.auth.signOut();
    toast.success("user logged out successfully ")
    router.push("/auth/login")
  }
  return (
    <div>
      <nav
        className="navbar navbar-expand-lg px-4"
        style={{ backgroundColor: "#343a40" }}
      >
        <Link className="navbar-brand fw-bold text-white" href="/">
          SupaNext
        </Link>
        {isLoggedIn ? (
          <div className="ms-auto">
            <Link
              className="me-3 text-white text-decoration-none"
              href="/auth/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="me-3 text-white text-decoration-none"
              href="/auth/profile"
            >
              Profile
            </Link>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="ms-auto">
            <Link className="me-3 text-white text-decoration-none" href="/">
              Home
            </Link>
            <Link
              className="text-white text-decoration-none"
              href="/auth/login"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
