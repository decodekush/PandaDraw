import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(50),
});

export const SignInSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(1).max(50),
});
