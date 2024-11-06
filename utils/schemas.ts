import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(3, { message: "Min length is 3 characters" }),
  lastName: z.string().min(3, { message: "Min length is 3 characters" }),
  username: z.string().min(3, { message: "Min length is 3 characters" }),
});
