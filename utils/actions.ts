"use server";

import { profileSchema } from "./schemas";

export const createProfileAction = async (
  prevState: unknown,
  formData: FormData
) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = profileSchema.parse(rawData);
    console.log(validatedFields);
    return { message: "Profile created" };
  } catch (e) {
    console.log(e);
    return { message: "Failed to create profile" };
  }
};
