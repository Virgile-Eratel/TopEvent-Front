import { z } from "zod";

import { UserSchemaSecure } from "../../users/api/schema.ts";
import { SubscriptionSchema } from "../../subscriptions/api/schema.ts";

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
    createdBy: z.lazy(() => UserSchemaSecure).nullish(),
    subscriptions: z.array(z.lazy(() => SubscriptionSchema)).default([]),
});

export type Event = z.infer<typeof EventSchema>;

const dateStringSchema = z
    .string({ message: "Date requise" })
    .min(1, { message: "Date requise" })
    .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Date invalide",
    });

export const EventCreateSchema = z
    .object({
        name: z.string().min(1, { message: "Nom requis" }),
        description: z.string().min(1, { message: "Description requise" }),
        location: z.string().min(1, { message: "Lieu requis" }),
        type: EventTypeEnum,
        isPublic: z.boolean(),
        startDate: dateStringSchema,
        endDate: dateStringSchema,
        limitSubscriptionDate: z
            .preprocess((value) => {
                if (value === "" || value === null || value === undefined) {
                    return null;
                }

                return value;
            }, dateStringSchema.nullable())
            .nullable(),
        totalPlaces: z
            .preprocess((value) => {
                if (value === "" || value === null || value === undefined) {
                    return null;
                }

                if (typeof value === "string") {
                    const parsed = Number(value);
                    return Number.isNaN(parsed) ? value : parsed;
                }

                return value;
            },
            z
                .number({ error: "Nombre de places invalide" })
                .int({ message: "Le nombre de places doit être un entier" })
                .positive({ message: "Le nombre de places doit être positif" })
                .nullable())
            .nullable(),
    })
    .superRefine((data, ctx) => {
        const start = Date.parse(data.startDate);
        const end = Date.parse(data.endDate);

        if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message: "La date de fin doit être postérieure à la date de début",
            });
        }

        if (data.limitSubscriptionDate) {
            const limit = Date.parse(data.limitSubscriptionDate);
            if (!Number.isNaN(limit) && !Number.isNaN(start) && limit >= start) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["limitSubscriptionDate"],
                    message:
                        "La clôture des inscriptions doit être antérieure au début de l'événement",
                });
            }
        }
    });

export type EventCreateInput = z.infer<typeof EventCreateSchema>;