import { z } from "zod";

import { UserRoleEnum, UserSchema } from "@/app/features/users/api/schema";

export const AuthUserSchema = UserSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    mail: true,
    role: true,
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
    token: z.string().min(1),
    user: AuthUserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const LoginSchema = z.object({
    mail: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(1, { message: "Mot de passe requis" }),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    firstName: z.string().min(1, { message: "Prénom requis" }),
    lastName: z.string().min(1, { message: "Nom requis" }),
    mail: z.string().email({ message: "Adresse email invalide" }),
    password: z.string().min(6, { message: "Mot de passe trop court (6 caractères min.)" }),
    role: UserRoleEnum,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

