"use client";

import { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function Profile() {
  const { userProfile, setUserProfile, setIsLoading } = useMyAppHook();

  useEffect(() => {
    const fetchProfileFromAuth = async () => {
      setIsLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        toast.error("Please log in to view your profile");
        setIsLoading(false);

        return;
      }

      const profile = {
        name: session.user.user_metadata?.fullName ?? "",
        email: session.user.email ?? "",
        gender: session.user.user_metadata?.gender ?? "",
        phone: session.user.user_metadata?.phone ?? "",
      };

      setUserProfile(profile);
      localStorage.setItem("user_profile", JSON.stringify(profile));
      setIsLoading(false);

    };

    fetchProfileFromAuth();
  }, [setIsLoading, setUserProfile]);



  return (
    <>
      {userProfile ? (
        <div className="container mt-5">
          <h2>Profile</h2>
          <div className="card p-4 shadow-sm">
            <p>
              <strong>Name:</strong> {userProfile?.name}
            </p>
            <p>
              <strong>Email:</strong> {userProfile?.email}
            </p>
            <p>
              <strong>Phone:</strong> {userProfile?.phone}
            </p>
            <p>
              <strong>Gender:</strong> {userProfile?.gender}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center mt-5">No Profile Found</p>
      )}
    </>
  );
}
