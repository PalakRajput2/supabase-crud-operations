"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useMyAppHook } from "@/context/AppUtils";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { setIsLoading, setIsLoggedIn, setAuthToken, setUserProfile } = useMyAppHook();

  // Email/Password login
  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    if (data?.session) {
      setAuthToken(data.session.access_token);
      setIsLoggedIn(true);
      setUserProfile(data.user);
      localStorage.setItem("access_token", data.session.access_token);
      localStorage.setItem("user_profile", JSON.stringify(data.user));
      toast.success("Login successful!");
      router.push("/auth/dashboard");
    }

    setIsLoading(false);
  };

  // Social OAuth
  const handleOAuth = async (provider: "google" | "github") => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/dashboard`, // Must be set in Supabase dashboard
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.loading("Redirecting to " + provider + "...");
    }

    setIsLoading(false);
  };

  return <LoginForm onSubmit={handleLogin} onOAuth={handleOAuth} />;
}
