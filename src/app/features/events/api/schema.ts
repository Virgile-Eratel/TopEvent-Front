import { z } from "zod";
import {EventSchema} from "../../event/api/schema.ts";

export const EventListItemSchema = EventSchema;
export const EventsArraySchema = z.array(EventSchema);

export type EventList = z.infer<typeof EventsArraySchema>;