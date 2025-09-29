"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from "react-icons/bs";

type LoginFormProps = {
    onSubmit: (data: { email: string; password: string }) => void;
    onOAuth: (provider: "google" | "github") => void;
};

export default function LoginForm({ onSubmit, onOAuth }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<{ email: string; password: string }>();

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <div className="card p-4 shadow-sm">
                <h3 className="mb-3 text-center">Login</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            {...register("email", { required: "Email is required" })}
                        />
                        {errors.email && (
                            <small className="text-danger">{errors.email.message}</small>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && (
                            <small className="text-danger">{errors.password.message}</small>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        Login
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-muted">Or continue with</p>
                    <div className="d-flex justify-content-center gap-3">
                        {/* Google */}
                        <button
                            className="btn btn-outline-success oauth-btn google rounded-circle d-flex align-items-center justify-content-center"
                            onClick={() => onOAuth("google")}
                        >
                            <BsGoogle size={20} />
                        </button>

                        {/* GitHub */}
                        <button
                            className="btn btn-outline-dark oauth-btn github rounded-circle d-flex align-items-center justify-content-center"
                            onClick={() => onOAuth("github")}
                        >
                            <BsGithub size={20} />
                        </button>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                        <p className="text-muted">Don't have an account ? </p>
                        <Link href="/auth/register" >Register Now</Link>
                    </div>


                </div>

            </div>
        </div>
    );
}
