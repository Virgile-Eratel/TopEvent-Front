import { useParams } from "react-router-dom";
import { useMemo } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import EventDetail from "@/app/features/event/ui/EventDetail";
import { useAdminSubscriptions } from "@/app/features/subscriptions/api/queries";
import { useEvent } from "@/app/features/events/api/queries";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";

dayjs.locale("fr");

export default function AdminEventDetail() {
    const params = useParams<{ eventId: string }>();
    const eventIdParam = params.eventId;
    
    const eventId = useMemo(() => {
        if (!eventIdParam) return null;
        const numeric = Number(eventIdParam);
        return Number.isFinite(numeric) ? numeric : null;
    }, [eventIdParam]);

    const isValidId = typeof eventId === "number" && eventId >= 0;
    const {
        data: subscriptions,
        isLoading: isLoadingSubscriptions,
        isError: isSubscriptionsError,
        error: subscriptionsError,
    } = useAdminSubscriptions(isValidId ? eventId : null);
    const { data: event } = useEvent(isValidId ? eventId : null);

    return (
        <>
            <EventDetail backLink="/admin/events" hideSubscriptionButton />
            
            {isValidId && (
                <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-6 p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inscriptions</CardTitle>
                            <CardDescription>
                                Liste des utilisateurs inscrits à cet événement
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSubscriptions ? (
                                <div className="space-y-2">
                                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                                </div>
                            ) : isSubscriptionsError ? (
                                <div className="text-sm text-destructive">
                                    {subscriptionsError instanceof Error 
                                        ? subscriptionsError.message 
                                        : "Erreur lors du chargement des inscriptions"}
                                </div>
                            ) : subscriptions && subscriptions.length > 0 ? (
                                <Table>
                                    <TableCaption>
                                        {(subscriptions?.length ?? event?.currentSubscribers ?? 0)} inscription{(subscriptions?.length ?? event?.currentSubscribers ?? 0) > 1 ? "s" : ""} au total
                                    </TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID Utilisateur</TableHead>
                                            <TableHead>Date d&apos;inscription</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscriptions.map((subscription) => (
                                            <TableRow key={subscription.id}>
                                                <TableCell className="font-medium">
                                                    Utilisateur #{subscription.userId}
                                                </TableCell>
                                                <TableCell>
                                                    {dayjs(subscription.subscriptionDate).format("DD MMMM YYYY HH:mm")}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Aucune inscription pour le moment.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}

