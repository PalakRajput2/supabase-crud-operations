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
  banner_image: yup.mixed<File>().nullable(),
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
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session?.access_token) {
          router.push("/auth/login");
          return;
        }

        setAuthToken(data.session.access_token);
        setUserId(data.session.user.id ?? null);
        localStorage.setItem("access_token", data.session.access_token);
        setIsLoggedIn(true);

        const profile = {
          name: data.session.user?.user_metadata.fullname,
          email: data.session.user?.email,
          gender: data.session.user?.user_metadata.gender,
          phone: data.session.user?.user_metadata.phone,
        };

        setUserProfile(profile);
        localStorage.setItem("user_profile", JSON.stringify(profile));

        await fetchProductsFromTable(data.session.user.id);
      } catch (err: any) {
        toast.error("Session expired, please log in again");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    handleLoginSession();
  }, [router, setAuthToken, setIsLoggedIn, setIsLoading, setUserProfile]);

  const uploadImageFile = async (file: File) => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExtension}`;

    const { error } = await supabase.storage.from("products-images").upload(fileName, file);
    if (error) {
      toast.error("Failed to upload banner image");
      return null;
    }

    const { data: publicUrlData } = supabase.storage.from("products-images").getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const onFormSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      let imagePath: string | null = null;
      const fileInput = formData.banner_image as FileList;

      if (fileInput && fileInput.length > 0) {
        const uploadedUrl = await uploadImageFile(fileInput[0]);
        if (!uploadedUrl) return;
        imagePath = uploadedUrl;
      } else if (preview) {
        imagePath = preview;
      }

      if (editId) {
        const { error } = await supabase
          .from("products")
          .update({
            title: formData.title,
            content: formData.content,
            cost: formData.cost,
            banner_image: imagePath,
          })
          .match({ id: editId, user_id: userId });

        if (error) toast.error("Failed to update product data");
        else toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert({
          title: formData.title,
          content: formData.content,
          cost: formData.cost,
          user_id: userId,
          banner_image: imagePath,
        });

        if (error) toast.error("Failed to add product");
        else {
          toast.success("Product created successfully!");
          if (userId) await fetchProductsFromTable(userId);
        }
        reset();
      }

      setPreview(null);
      if (userId) await fetchProductsFromTable(userId);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsFromTable = async (userId: string) => {
    const { data } = await supabase.from("products").select("*").eq("user_id", userId);
    if (data) setProducts(data as ProductType[]);
  };

  const handleEditData = (product: ProductType) => {
    setValue("title", product.title);
    setValue("content", product.content);
    setValue("cost", product.cost);
    setPreview(product.banner_image);
    setEditId(product.id!);
  };

  const handleDeleteProduct = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the product permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from("products").delete().match({
          id,
          user_id: userId,
        });
        if (error) toast.error("Failed to delete product");
        else {
          Swal.fire("Deleted!", "Product has been removed.", "success");
          if (userId) await fetchProductsFromTable(userId);
        }
      }
    });
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Add Product Form */}
        <div className="col-md-4">
          <h3 className="mb-4">{editId ? "Edit Product" : "Add Product"}</h3>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="mb-3">
              <label className="form-label"><b>Title</b></label>
              <input type="text" className="form-control" {...register("title")} />
              <small className="text-danger">{errors.title?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label"><b>Content</b></label>
              <textarea className="form-control" {...register("content")} />
              <small className="text-danger">{errors.content?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label"><b>Cost</b></label>
              <input type="number" className="form-control" {...register("cost")} />
              <small className="text-danger">{errors.cost?.message}</small>
            </div>
            <div className="mb-3">
              <label className="form-label"><b>Banner Image</b></label>
              <div className="mb-2">
                {preview && <Image src={preview} alt="Preview" width={100} height={100} />}
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
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{p.content}</td>
                    <td>${p.cost}</td>
                    <td>
                      {p.banner_image ? (
                        <Image src={p.banner_image} alt={p.title} width={100} height={50} />
                      ) : "-"}
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditData(p)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleDeleteProduct(p.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
