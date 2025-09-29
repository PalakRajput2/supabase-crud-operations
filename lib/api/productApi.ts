import { supabase } from "../supabaseClient";

export type Product = {
  id?: string;
  title: string;
  content: string;
  cost: number;
  banner_image?: string; // store public URL
  user_id?: string;
};

// Helper: Upload image to Supabase Storage
export const uploadBannerImage = async (file: File, userId: string) => {
  const fileExt = file.name.split(".").pop();
  const filePath = `banners/${userId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("products-images")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("products-images").getPublicUrl(filePath);

  return data.publicUrl; // return public URL
};

// CREATE
export const createProduct = async (product: Product) => {
  return await supabase.from("products").insert(product).select().single();
};

// READ
export const getProducts = async (userId: string) => {
  return await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
};

// UPDATE
export const updateProduct = async (id: string, product: Partial<Product>) => {
  return await supabase.from("products").update(product).eq("id", id).select().single();
};

// DELETE
export const deleteProduct = async (id: string) => {
  return await supabase.from("products").delete().eq("id", id);
};
