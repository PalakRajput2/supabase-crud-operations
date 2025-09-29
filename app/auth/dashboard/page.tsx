/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMyAppHook } from "@/context/AppUtils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface ProductType {
  id?: number;
  title: string;
  content?: string;
  cost?: string;
  banner_image?: string | File | null;
}

const formSchema = yup.object().shape({
  title: yup.string().required("Product title is required"),
  content: yup.string().required("Description is required"),
  cost: yup.string().required("Product cost is required"),
});

export default function Dashboard() {
  const [preview, setPreview] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { setAuthToken, setIsLoggedIn, isLoggedIn, setUserProfile } =
    useMyAppHook();
  const router = useRouter();

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
  });

  useEffect(() => {
    const handleLoginSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        toast.error("Failed to get user data");
        router.push("/auth/login");
        return;
      }
      if (data.session?.access_token) {
        setAuthToken(data.session?.access_token);
        setUserId(data.session?.user.id ?? null);
        localStorage.setItem("access_token", data.session?.access_token);
        setIsLoggedIn(true);
        setUserProfile({
          name: data.session.user?.user_metadata.fullname,
          email: data.session.user?.user_metadata.email,
          gender: data.session.user?.user_metadata.gender,
          phone: data.session.user?.user_metadata.phone,
        });
        localStorage.setItem(
          "user_profile",
          JSON.stringify({
            name: data.session.user?.user_metadata.fullName,
            email: data.session.user?.user_metadata.email,
            gender: data.session.user?.user_metadata.gender,
            phone: data.session.user?.user_metadata.phone,
          })
        );
      }
    };

    handleLoginSession();

    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
  }, []);

  // Upload Banner Image
  const uploadImageFile = async (file: File) => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const { data, error } = await supabase.storage
      .from("products-images")
      .upload(fileName, file);

    if (error) {
      toast.error("Error while uploading the image");
      return null;
    }

    return supabase.storage
      .from("products-images")
      .getPublicUrl(fileName).data.publicUrl;
  };

  // Form submit
  const onFormSubmit = async (formData: any) => {
    let imagePath = null;
    if (formData.banner_image instanceof File) {
      imagePath = await uploadImageFile(formData.banner_image);
      if (!imagePath) return;
    }

    const { data, error } = await supabase.from("products").insert({
      ...formData,
      user_id: userId,
      banner_image: imagePath,
    });
    if (error) {
      toast.error("Failed to Add Product");
    } else {
      toast.success("Successfully Product has been created!");
    }
    reset();
  }; 

  return (
    <>
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-5">
            <h3>Add Product</h3>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("title")}
                />
                <small className="text-danger">
                  {errors.title?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  {...register("content")}
                ></textarea>
                <small className="text-danger">
                  {errors.content?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Cost</label>
                <input
                  type="number"
                  className="form-control"
                  {...register("cost")}
                />
                <small className="text-danger">
                  {errors.cost?.message}
                </small>
              </div>
              <div className="mb-3">
                <label className="form-label">Banner Image</label>
                <div className="mb-2">
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      id="bannerPreview"
                      width={100}
                      height={100}
                    />
                  ) : (
                    ""
                  )}
                </div>
                <input
                  type="file"
                  className="form-control"
                  onChange={(event) => {
                    if (event.target.files?.[0]) {
                      setValue("banner_image", event.target.files[0]);
                      setPreview(URL.createObjectURL(event.target.files[0]));
                    }
                  }}
                />
              </div>
              <button type="submit" className="btn btn-success w-100">
                Add Product
              </button>
            </form>
          </div>

          <div className="col-md-7">
            <h3>Product List</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Cost</th>
                  <th>Banner Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products ? (
                  <tr>
                    <td>Sample Product</td>
                    <td>Sample Content</td>
                    <td>$100</td>
                    <td>
                      {preview ? (
                        <Image
                          src=""
                          alt="Sample Product"
                          id="bannerPreview"
                          width={50}
                          height={50}
                        />
                      ) : (
                        ""
                      )}
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm">Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 
