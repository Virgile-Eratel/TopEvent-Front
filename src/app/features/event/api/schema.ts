import { z } from "zod";
import {UserSchemaSecure} from "../../users/api/schema.ts";
import {SubscriptionSchema} from "../../subscriptions/api/schema.ts";

export const EventTypeEnum = z.enum(["concert", "webinaire", "conference"]);

export const EventSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    startDate: z.coerce.date(),
    description: z.string().nullable(),
    endDate: z.coerce.date(),
    location: z.string(),
    type: EventTypeEnum.nullable(),
    isPublic: z.boolean(),
    totalPlaces: z.number().int().nullable(),
    limitSubscriptionDate: z.coerce.date().nullable(),
    createdBy: z.lazy(() => UserSchemaSecure),
    subscriptions: z.array(z.lazy(() => SubscriptionSchema)).default([]),
});

export type Event = z.infer<typeof EventSchema>;