import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useMemo } from "react";
import { useEvent } from "@/app/features/events/api/queries";
import { Badge } from "@/shared/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
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

export default function EventDetail() {
    const params = useParams<{ eventId: string }>();
    const eventIdParam = params.eventId;
    const eventId = useMemo(() => {
        if (!eventIdParam) return null;
        const numeric = Number(eventIdParam);
        return Number.isFinite(numeric) ? numeric : null;
    }, [eventIdParam]);

    const isValidId = typeof eventId === "number" && eventId >= 0;
    const {
        data: event,
        isLoading,
        isError,
        error,
    } = useEvent(isValidId ? eventId : 0);

    if (!eventIdParam || !isValidId) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <div className="text-sm text-destructive">
                    Identifiant d&apos;événement invalide.
                </div>
                <Button asChild variant="ghost" className="w-fit">
                    <Link to="/events">&larr; Retour à la liste</Link>
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <div className="h-8 w-56 animate-pulse rounded bg-muted" />
                <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
            </div>
        );
    }

    if (isError) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle>Impossible de charger l&apos;événement</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="ghost">
                            <Link to="/events">&larr; Retour à la liste</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Événement introuvable</CardTitle>
                        <CardDescription>
                            L&apos;événement demandé n&apos;existe pas ou n&apos;est plus disponible.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="ghost">
                            <Link to="/events">&larr; Retour à la liste</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const duration = `${dayjs(event.startDate).format("DD MMMM YYYY HH:mm")} → ${dayjs(event.endDate).format("DD MMMM YYYY HH:mm")}`;
    const limitDate = event.limitSubscriptionDate
        ? dayjs(event.limitSubscriptionDate).format("DD MMMM YYYY HH:mm")
        : "Aucune";

    return (
        <div className="mx-auto flex max-w-4xl flex-1 flex-col gap-6 p-6">
            <Button asChild variant="ghost" className="w-fit">
                <Link to="/events">&larr; Retour à la liste</Link>
            </Button>

            <Card>
                <CardHeader className="gap-3">
                    <div className="flex items-center gap-3">
                        <CardTitle>{event.name}</CardTitle>
                        {event.type && (
                            <Badge className="capitalize" variant="secondary">
                                {event.type}
                            </Badge>
                        )}
                        <Badge variant={event.isPublic ? "default" : "outline"}>
                            {event.isPublic ? "Public" : "Privé"}
                        </Badge>
                    </div>
                    {event.description && (
                        <CardDescription>{event.description}</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Horaires</dt>
                            <dd className="text-right font-medium">{duration}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Lieu</dt>
                            <dd className="text-right font-medium">{event.location}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-border/40 pb-2">
                            <dt className="text-muted-foreground">Clôture des inscriptions</dt>
                            <dd className="text-right font-medium">{limitDate}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Places disponibles</dt>
                            <dd className="text-right font-medium">
                                {event.totalPlaces ?? "Illimité"}
                            </dd>
                        </div>
                    </dl>

                    <div className="space-y-4 rounded-lg border border-border/60 p-4">
                        <h2 className="text-lg font-semibold">Organisateur</h2>
                        <div className="text-sm font-medium">
                            {event.createdBy
                                ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                                : "Non renseigné"}
                        </div>
                        {event.createdBy && (
                            <div className="text-sm text-muted-foreground">
                                <div>{event.createdBy.mail}</div>
                                <div className="capitalize">{event.createdBy.role}</div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Inscriptions ({event.subscriptions.length})</span>
                        {event.limitSubscriptionDate && (
                            <span>
                                Dernière mise à jour le {dayjs().format("DD/MM/YYYY à HH:mm")}
                            </span>
                        )}
                    </div>

                    {event.subscriptions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {event.subscriptions.map((subscription) => (
                                    <TableRow key={subscription.id}>
                                        <TableCell>{subscription.id}</TableCell>
                                        <TableCell>{subscription.userID}</TableCell>
                                        <TableCell>
                                            {dayjs(subscription.subscriptionDate).format(
                                                "DD/MM/YYYY HH:mm"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableCaption>
                                {event.subscriptions.length} inscription(s) enregistrée(s)
                            </TableCaption>
                        </Table>
                    ) : (
                        <div className="rounded-md border border-dashed border-border/50 bg-muted/40 p-4 text-sm text-muted-foreground">
                            Aucune inscription pour le moment.
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}