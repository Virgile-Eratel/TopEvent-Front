import * as dayjs from "dayjs";
import type {Event} from "@/app/features/event/api/schema.ts";

export const eventsMock: Event[] = [
    {
        id: 1,
        name: "Rennes JS Meetup",
        description: "Talks & networking",
        location: "Rennes",
        startDate: dayjs().add(3, "day").hour(18).minute(30).toDate(),
        endDate: dayjs().add(3, "day").hour(21).minute(0).toDate(),
        type: "conference",
        isPublic: true,
        totalPlaces: 120,
        limitSubscriptionDate: dayjs().add(2, "day").endOf("day").toDate(),
        createdBy: { id: 10, lastName: "Martin", firstName: "Alice", mail: "alice@example.com" , role: "admin", password: "test", subscriptions: [] },
        subscriptions: [
            {
                id: 101,
                userID: 55,
                eventId: 1,
                subscriptionDate: dayjs().subtract(1, "day").toDate(), // <= si ton SubscriptionSchema attend Date
            },
        ],
    },
    {
        id: 2,
        name: "Live Coding Concert",
        description: "Musique + code",
        location: "Paris",
        startDate: dayjs().add(10, "day").hour(20).toDate(),
        endDate: dayjs().add(10, "day").hour(22).toDate(),
        type: "concert",
        isPublic: true,
        totalPlaces: 300,
        limitSubscriptionDate: dayjs().add(9, "day").endOf("day").toDate(),
        createdBy: { id: 11, lastName: "Durand", firstName: "Bob", mail: "bob@example.com", role: "admin", password: "test", subscriptions: [] },
        subscriptions: [],
    },
    {
        id: 3,
        name: "Webinaire React 19",
        description: "Nouveautés & patterns",
        location: "Remote",
        startDate: dayjs().add(20, "day").hour(17).toDate(),
        endDate: dayjs().add(20, "day").hour(18).toDate(),
        type: "webinaire",
        isPublic: true,
        totalPlaces: null,
        limitSubscriptionDate: null,
        createdBy: { id: 12, lastName: "Chen", firstName: "Lee", mail: "lee@example.com", role: "admin", password: "test", subscriptions: [] },
        subscriptions: [],
    },
];