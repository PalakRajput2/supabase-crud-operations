import { supabase } from "../supabaseClient";

export const registerUser = async (formData: {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
}) => {
  const { fullName, email, password, gender, phone } = formData;

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        gender,
        phone,
      },
    },
  });
};
