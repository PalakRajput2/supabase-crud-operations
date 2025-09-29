"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/validations/authValidations";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMyAppHook } from "@/context/AppUtils";

type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  confirm_password: string;
};

export default function Register() {

  const router = useRouter();

  const {setIsLoading} = useMyAppHook();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (formdata: RegisterFormData) => {
    setIsLoading(true);
    const {fullName , email, password, gender, phone} = formdata;
    const {data , error } = await supabase.auth.signUp({
      email , password , 
      options :{
        data:{
          fullName , gender , phone
        }
      }
    });
    if(error){
      toast.error("Not registered successfully");
    }else{
      toast.success("User registered successfully")
      setIsLoading(false)
      router.push("/auth/login")
    }
  
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow-sm p-4">
            <h2 className="text-center mb-2">Sign Up</h2>
                <span className="mb-4 text-center">Create your account here</span>
              
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name + Email */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.fullName ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your name"
                    {...register("fullName")}
                  />
                  <p className="text-danger small">
                    {errors.fullName?.message}
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Email <span className="text-danger">*</span></label>
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
              </div>

              {/* Phone + Gender */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Phone <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    placeholder="Enter your phone number"
                    {...register("phone")}
                  />
                  <p className="text-danger small">{errors.phone?.message}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Gender <span className="text-danger">*</span></label>
                  <select
                    className={`form-select ${
                      errors.gender ? "is-invalid" : ""
                    }`}
                    {...register("gender")}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-danger small">{errors.gender?.message}</p>
                </div>
              </div>

              {/* Password + Confirm Password */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter password"
                    {...register("password")}
                  />
                  <p className="text-danger small">
                    {errors.password?.message}
                  </p>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Confirm Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.confirm_password ? "is-invalid" : ""
                    }`}
                    placeholder="Confirm password"
                    {...register("confirm_password")}
                  />
                  <p className="text-danger small">
                    {errors.confirm_password?.message}
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="row justify-content-center">
                <button
                  type="submit"
                  className="btn btn-primary w-50 py-2 mb-4"
                >
                  Register
                </button>
              </div>
            </form>

            {/* Redirect to Login */}
            <p className="text-center mb-0">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-decoration-none">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
