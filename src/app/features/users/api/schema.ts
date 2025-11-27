import { z } from "zod";
import {SubscriptionSchema} from "../../subscriptions/api/schema.ts";

export const UserRoleEnum = z.enum(["user", "admin"]);

export const UserSchema = z.object({
    id: z.number().int(),
    lastName: z.string(),
    firstName: z.string(),
    mail: z.email(),
    password: z.string(),
    role: UserRoleEnum,
    subscriptions: z.array(z.lazy(() => SubscriptionSchema)).default([]),
});

export const UserSchemaSecure = UserSchema.omit({ password: true, subscriptions: true, role: true });
export type UserSecure = z.infer<typeof UserSchemaSecure>;

export type User = z.infer<typeof UserSchema>;

export const UserUpdateSchema = z.object({
    firstName: z.string().min(1, { message: "Prénom requis" }),
    lastName: z.string().min(1, { message: "Nom requis" }),
    mail: z.string().email({ message: "Email invalide" }),
});

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
