"use client";
import Loader from "@/components/Loader";
import { createContext, useContext, useEffect, useState } from "react";

interface AppUtilsType {
  isLoggedIn: boolean;
  setIsLoggedIn: (state: boolean) => void;
    setAuthToken: (state: string | null) => void; 
   userProfile: null,
    setUserProfile: (state:null) => void,
    setIsLoading:(state : boolean) => void
  
}

const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined);

export const AppUtilsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
   const [userProfile, setUserProfile] = useState<null>(null);
  const [ isLoading , setIsLoading] = useState(false)



  useEffect(() => {
    const token = localStorage.getItem("access_token");
     const userProfile = localStorage.getItem("user_profile");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
      setUserProfile(JSON.parse(userProfile))
    }
  },[]);

  return (
    <AppUtilsContext.Provider
      value={{ isLoggedIn, setAuthToken, setIsLoggedIn ,  userProfile, setUserProfile,setIsLoading }}
    >
      { isLoading ? <Loader/> :  children}
    </AppUtilsContext.Provider>
  );
};

export const useMyAppHook = () => {
  const context = useContext(AppUtilsContext);
  if (!context) {
    throw new Error("App utils must be used inside AppUtilsProvider");
  }
  return context;
};
