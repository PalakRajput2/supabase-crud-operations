"use client";

import { useMyAppHook } from "@/context/AppUtils";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/validations/authValidations";

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { isLoggedIn , setIsLoggedIn, setAuthToken } = useMyAppHook();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/auth/dashboard");
      return;
    }
  }, [isLoggedIn]);

 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const { email, password } = data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Failed to login");
    } else {
       if (data.session?.access_token) {
        setAuthToken(data.session?.access_token);
        localStorage.setItem("access_token", data.session?.access_token);
        setIsLoggedIn(true);
        toast.success("User logged in successfully");
      }
    }
  };

  const handleSocialOauth = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/dashboard`,
      },
    });
    if (error) {
      toast.error("Failed to login via Social Oauth");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-4">Login</h2>

         
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your email"
                  {...register("email")}
                />
                <p className="text-danger small">{errors.email?.message}</p>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your password"
                  {...register("password")}
                />
                <p className="text-danger small">{errors.password?.message}</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
              >
                Login
              </button>
            </form>

            {/* Social login */}
            <button
              className="btn btn-success mb-3 py-2 w-100"
              onClick={() => handleSocialOauth("google")}
            >
              <FaGoogle /> Log in with Google
            </button>
            <button
              className="btn btn-dark py-2 mb-3 w-100"
              onClick={() => handleSocialOauth("github")}
            >
              <FaGithub /> Log in with GitHub
            </button>

            {/* Register link */}
            <p className="text-center mb-0">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-decoration-none">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
