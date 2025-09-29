"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Product } from "@/lib/api/productApi";
import { productSchema } from "@/validations/authValidations";

type ProductFormProps = {
  onSubmit: (data: Product, file: File | null) => void;
  editId: string | null;
  defaultValues?: Product;
  previewUrl: string | null;
  setFile: (file: File | null) => void;
  setPreviewUrl: (url: string | null) => void;
  file: File | null;
};

export default function ProductForm({
  onSubmit,  editId,  defaultValues,  previewUrl, setFile, setPreviewUrl, file,}: ProductFormProps) {
  const {register,handleSubmit,reset,formState: { errors },} = useForm<Product>({
    resolver: yupResolver(productSchema),
    defaultValues,
  });

  // Reset when switching between add/edit
  useEffect(() => {
    if (editId && defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, editId, reset]);

  return (
    <div className="card p-3 shadow-sm">
      <h4 className="mb-3">{editId ? "Edit Product" : "Add Product"}</h4>
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data, file);
          //  Reset to empty form always after submit
          reset({ title: "", content: "", cost: 0 });
          setFile(null);
          setPreviewUrl(null);
        })}
      >
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
          <div className="mb-2 text-center">
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "cover" }}
              className="rounded shadow-sm"
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
