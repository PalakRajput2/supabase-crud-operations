/* eslint-disable @typescript-eslint/no-unused-expressions */
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
import Swal from "sweetalert2";

interface ProductType {
  id?: number;
  title: string;
  content: string;
  cost: string;
  banner_image: string | null;
}

const formSchema = yup.object().shape({
  title: yup.string().required("Product title is required"),
  content: yup.string().required("Description is required"),
  cost: yup.string().required("Product cost is required"),
 banner_image: yup.mixed<File>().nullable(), // allow File | null
});

export default function Dashboard() {
  const [preview, setPreview] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const { setAuthToken, setIsLoggedIn, isLoggedIn, setUserProfile, setIsLoading } =
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
      setIsLoading(true);
      if (data.session?.access_token) {
        setAuthToken(data.session?.access_token);
        setUserId(data.session?.user.id ?? null);
        localStorage.setItem("access_token", data.session?.access_token);
        setIsLoggedIn(true);

        const profile = {
          name: data.session.user?.user_metadata.fullname,
          email: data.session.user?.user_metadata.email,
          gender: data.session.user?.user_metadata.gender,
          phone: data.session.user?.user_metadata.phone,
        };

        setUserProfile(profile);
        localStorage.setItem("user_profile", JSON.stringify(profile));

        fetchProductsFromTable(data.session.user.id);
      }
      setIsLoading(false);
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

    const { error } = await supabase.storage
      .from("products-images") // bucket name
      .upload(fileName, file);

    if (error) {
      toast.error("Failed to upload banner image");
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("products-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  // Form submit
  const onFormSubmit = async (formData: any) => {
    setIsLoading(true);

    let imagePath: string | null = null;
    const fileInput = formData.banner_image as FileList;

    if (fileInput && fileInput.length > 0) {
      const uploadedUrl = await uploadImageFile(fileInput[0]);
      if (!uploadedUrl) {
        setIsLoading(false);
        return;
      }
      imagePath = uploadedUrl;
    } else if (preview) {
      // keep existing preview if editing
      imagePath = preview;
    }

    if (editId) {
      // Edit Operation
      const { error } = await supabase
        .from("products")
        .update({
          title: formData.title,
          content: formData.content,
          cost: formData.cost,
          banner_image: imagePath,
        })
        .match({
          id: editId,
          user_id: userId,
        });

      if (error) {
        toast.error("Failed to update product data");
      } else {
        toast.success("Product has been updated successfully");
      }
    } else {
      const { error } = await supabase.from("products").insert({
        title: formData.title,
        content: formData.content,
        cost: formData.cost,
        user_id: userId,
        banner_image: imagePath,
      });

      if (error) {
        toast.error("Failed to Add Product");
      } else {
        toast.success("Successfully Product has been created!");
        if (userId) fetchProductsFromTable(userId);
      }
      reset();
    }

    setPreview(null);
    if (userId) fetchProductsFromTable(userId);
    setIsLoading(false);
  };

  const fetchProductsFromTable = async (userId: string) => {
    setIsLoading(true);

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId);

    if (data) {
      setProducts(data as ProductType[]);
    }
    setIsLoading(false);
  };

  const handleEditData = (product: ProductType) => {
    setValue("title", product.title);
    setValue("content", product.content);
    setValue("cost", product.cost);
    setPreview(product.banner_image); // always string | null now
    setEditId(product.id!);
  };

  const handleDeleteProduct = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from("products").delete().match({
          id: id,
          user_id: userId,
        });

        if (error) {
          toast.error("Failed to delete product");
        } else {
          Swal.fire({
            title: "Deleted!",
            text: "The product has been deleted",
            icon: "success",
          });
          if (userId) fetchProductsFromTable(userId);
        }
      }
    });
  };

  return (
    <div className="container mt-5 ">
      <div className="row">
        {/* Add Product Form */}
        <div className="col-md-4 ">
          <h3 className="mb-4">{editId ? "Edit Product" : "Add Product"}</h3>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="mb-3">
              <label className="form-label">
                {" "}
                <b>Title</b>
              </label>
              <input
                type="text"
                className="form-control"
                {...register("title")}
              />
              <small className="text-danger">{errors.title?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label">
                <b>Content</b>
              </label>
              <textarea className="form-control" {...register("content")} />
              <small className="text-danger">{errors.content?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label">
                <b>Cost</b>
              </label>
              <input
                type="number"
                className="form-control"
                {...register("cost")}
              />
              <small className="text-danger">{errors.cost?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label">
                <b>Banner Image</b>
              </label>
              <div className="mb-2">
                {preview && (
                  <Image src={preview} alt="Preview" width={100} height={100} />
                )}
              </div>
              <input
                type="file"
                className="form-control"
                {...register("banner_image")}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </div>
            <button type="submit" className="btn btn-success w-100">
              {editId ? "Update Product" : "Add Product"}
            </button>
          </form>
        </div>

        {/* Product List */}
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
              {products.length > 0 ? (
                products.map((singleProduct) => (
                  <tr key={singleProduct.id}>
                    <td>{singleProduct.title}</td>
                    <td>{singleProduct.content}</td>
                    <td>${singleProduct.cost}</td>
                    <td>
                      {singleProduct.banner_image ? (
                        <Image
                          src={singleProduct.banner_image}
                          alt={singleProduct.title}
                          width={100}
                          height={50}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditData(singleProduct)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: "10px" }}
                        onClick={() => handleDeleteProduct(singleProduct.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
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
  );
}
