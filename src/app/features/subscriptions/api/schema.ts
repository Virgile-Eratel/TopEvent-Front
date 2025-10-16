import { z } from "zod";

export const SubscriptionSchema = z.object({
    id: z.number().int(),
    userID: z.number().int(),
    eventId: z.number().int(),
    subscriptionDate: z.coerce.date(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;