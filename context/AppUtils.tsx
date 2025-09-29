"use client";
import Loader from "@/components/Loader";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface UserProfile {
  name?: string;
  email?: string;
  gender?: string;
  phone?: string;
}

interface AppUtilsType {
  isLoggedIn: boolean;
  setIsLoggedIn: (state: boolean) => void;

  authToken: string | null;
  setAuthToken: (state: string | null) => void;

  userProfile: UserProfile | null;
  setUserProfile: (state: UserProfile | null) => void;

  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
}

const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined);

export const AppUtilsProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 🔹 Remove hash (#) after OAuth redirect
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname);
    }

    // 🔹 Check initial session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
        localStorage.setItem("access_token", data.session.access_token);
        setIsLoggedIn(true);

        // also set profile
        if (data.session.user) {
          const profile = {
            name: data.session.user.user_metadata?.name || "",
            email: data.session.user.email || "",
          };
          setUserProfile(profile);
          localStorage.setItem("user_profile", JSON.stringify(profile));
        }
      }
    });

    // 🔹 Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        setAuthToken(session.access_token);
        localStorage.setItem("access_token", session.access_token);
        setIsLoggedIn(true);

        if (session.user) {
          const profile = {
            name: session.user.user_metadata?.name || "",
            email: session.user.email || "",
          };
          setUserProfile(profile);
          localStorage.setItem("user_profile", JSON.stringify(profile));
         }
      } else {
        setAuthToken(null);
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setUserProfile(null);
        localStorage.removeItem("user_profile");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppUtilsContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, authToken, setAuthToken,
        userProfile,
        setUserProfile,
        isLoading,
        setIsLoading,
      }}
    >
      {children}

      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-85"
          style={{ zIndex: 9999 }}
        >
          <Loader />
        </div>
      )}
    </AppUtilsContext.Provider>
  );
};

export const useMyAppHook = () => {
  const context = useContext(AppUtilsContext);
  if (!context) {
    throw new Error("useMyAppHook must be used inside AppUtilsProvider");
  }
  return context;
};
