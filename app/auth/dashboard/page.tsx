"use client";

import { useEffect, useState } from "react";
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
import Swal from "sweetalert2";
import ProductForm from "@/components/Products/ProductForm";
import ProductsTable from "@/components/Products/ProductsTable";

export default function Dashboard() {
  const { setIsLoading } = useMyAppHook();
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleSortToggle = () => {
    if (sortOrder === null) setSortOrder("asc");
    else if (sortOrder === "asc") setSortOrder("desc");
    else setSortOrder(null);
  };

  // Apply sorting before rendering
  const sortedProducts = [...products].sort((a, b) => {
    if (sortOrder === "asc") return a.cost - b.cost;
    if (sortOrder === "desc") return b.cost - a.cost;
    return 0; // default unsorted
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

  // Add / Update
  const onSubmit = async (formData: Product, file: File | null) => {
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
        // Update product
        result = await updateProduct(editId, {
          ...formData,
          ...(imageUrl ? { banner_image: imageUrl } : {}),
        });
        if (!result.error) {
          toast.success("Product updated");
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editId
                ? { ...p, ...formData, banner_image: imageUrl || p.banner_image }
                : p
            )
          );
        }
      } else {
        // Create product
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

      // Reset everything after submit
      setEditId(null);
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.message);
    }
    setIsLoading(false);
  };

  // Delete with confirmation
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

  // Edit
  const handleEdit = (product: Product) => {
    setEditId(product.id!);
    setPreviewUrl(product.banner_image || null);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
        {/* Left column: Form */}
        <div className="col-md-5">
          <ProductForm
            onSubmit={onSubmit}
            editId={editId}
            defaultValues={
              editId ? products.find((p) => p.id === editId) || undefined : undefined
            }
            previewUrl={previewUrl}
            setFile={setFile}
            setPreviewUrl={setPreviewUrl}
            file={file}
          />
        </div>

        {/* Right column: Products list */}
        <div className="col-md-7">
          <h4>Your Products</h4>
          <ProductsTable
            products={sortedProducts}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
          />
        </div>
      </div>
    </div>
  );
}
