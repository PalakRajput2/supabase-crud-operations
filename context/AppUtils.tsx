"use client";
import Loader from "@/components/Loader";
import { createContext, useContext, useEffect, useState } from "react";

// Define user profile shape
interface UserProfile {
  name?: string;
  email?: string;
  gender?: string;
  phone?: string;
}

// Define context type
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const profile = localStorage.getItem("user_profile");

    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }

    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch {
        setUserProfile(null);
      }
    }
  }, []);

  return (
    <AppUtilsContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        authToken,
        setAuthToken,
        userProfile,
        setUserProfile,
        isLoading,
        setIsLoading,
      }}
    >
      {isLoading ? <Loader /> : children}
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
