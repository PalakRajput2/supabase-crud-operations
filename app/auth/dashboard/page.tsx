"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useMyAppHook } from "@/context/AppUtils";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadBannerImage,
  Product,
} from "@/lib/api/productApi";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { productSchema } from "@/validations/authValidations";
import Swal from "sweetalert2"; 

export default function Dashboard() {
  const { setIsLoading } = useMyAppHook();
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Product>({
    resolver: yupResolver(productSchema),
  });

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await getProducts(user.id);
        if (error) toast.error(error.message);
        else setProducts(data || []);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const onSubmit = async (formData: Product) => {
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not found");
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl: string | undefined;
      if (file) {
        imageUrl = await uploadBannerImage(file, user.id);
      }

      let result;
      if (editId) {
        result = await updateProduct(editId, {
          ...formData,
          ...(imageUrl ? { banner_image: imageUrl } : {}),
        });
        if (!result.error) {
          toast.success("Product updated");
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editId ? { ...p, ...formData, banner_image: imageUrl || p.banner_image } : p
            )
          );
        }
      } else {
        result = await createProduct({
          ...formData,
          user_id: user.id,
          banner_image: imageUrl,
        });
        if (!result.error) {
          toast.success("Product created");
          setProducts([result.data, ...products]);
        }
      }

      if (result.error) toast.error(result.error.message);
      reset();
      setEditId(null);
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.message);
    }

    setIsLoading(false);
  };

 const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        const { error } = await deleteProduct(id);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Product deleted");
          setProducts(products.filter((p) => p.id !== id));
        }
        setIsLoading(false);

        
      }
    });
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id!);
    setValue("title", product.title);
    setValue("content", product.content);
    setValue("cost", product.cost);
    setPreviewUrl(product.banner_image || null);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
        {/* Left column: Form */}
        <div className="col-md-5">
          <div className="card p-3 shadow-sm">
            <h4 className="mb-3">{editId ? "Edit Product" : "Add Product"}</h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="m-1"><b>Title</b></label>
              <input
                type="text"
                placeholder="Title"
                {...register("title")}
                className="form-control mb-2"
              />
              <p className="text-danger">{errors.title?.message}</p>

              <label className="m-1"><b>Content</b></label>
              <textarea
                placeholder="Content"
                {...register("content")}
                className="form-control mb-2"
              />
              <p className="text-danger">{errors.content?.message}</p>

              <label className="m-1"><b>Cost</b></label>
              <input
                type="number"
                placeholder="Cost"
                {...register("cost")}
                className="form-control mb-2"
              />
              <p className="text-danger">{errors.cost?.message}</p>

              {/* Banner Image */}
              <label className="m-1"><b>Product Image</b></label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  if (selectedFile) {
                    setPreviewUrl(URL.createObjectURL(selectedFile));
                  } else {
                    setPreviewUrl(null);
                  }
                }}
                className="form-control mb-3"
              />

              {/* Image Preview */}
              {previewUrl && (
                <div className="mb-3 text-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover" }}
                    className="rounded shadow-sm"
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                {editId ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Products list (Table) */}
        <div className="col-md-7">
          <h4>Your Products</h4>
          <div className="card p-3 shadow-sm">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.banner_image && (
                          <img
                            src={p.banner_image}
                            alt={p.title}
                            style={{ width: "60px", height: "40px", objectFit: "cover" }}
                            className="rounded"
                          />
                        )}
                      </td>
                      <td>{p.title}</td>
                      <td>{p.content}</td>
                      <td>₹{p.cost}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(p.id!)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
