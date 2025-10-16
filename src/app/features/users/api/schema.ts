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

export type User = z.infer<typeof UserSchema>;